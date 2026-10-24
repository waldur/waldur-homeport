import { OpenStreetMapProvider } from 'leaflet-geosearch';

type SearchArgument = Parameters<OpenStreetMapProvider['search']>[0];
type SearchResults = Awaited<ReturnType<OpenStreetMapProvider['search']>>;
type ProviderOptions = ConstructorParameters<typeof OpenStreetMapProvider>[0];

/** The public Nominatim server allows at most one request a second. */
export const MIN_REQUEST_INTERVAL_MS = 1000;
/** A request that has not answered by then is aborted. */
export const REQUEST_TIMEOUT_MS = 10_000;
/** How long to stop searching once the server throttles or blocks us. */
export const BACKOFF_MS = 60_000;
const CACHE_SIZE = 20;
const CACHE_TTL_MS = 5 * 60_000;

// RequestType.SEARCH, which leaflet-geosearch's index does not export.
const SEARCH_REQUEST = 0;

class GeocoderError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
  }
}

interface PoliteProviderOptions {
  /** A search the user asked for found nothing. */
  onNoResults?(query: string): void;
  /** A search the user asked for failed or was held back. */
  onError?(error: GeocoderError): void;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const normalize = (query: string) =>
  query.trim().replace(/\s+/g, ' ').toLowerCase();

/**
 * Searches the public Nominatim server within its usage policy, whatever the
 * search control does: holding Enter fires a submit on every key repeat.
 *
 * - An empty query sends nothing.
 * - Results are cached by query (the last 20, for 5 minutes), so repeating
 *   a search sends nothing.
 * - One request at a time, and each starts at least a second after the one
 *   before it. A search that arrives meanwhile waits; if another arrives while
 *   it waits, only the newest is sent and the superseded one finds nothing,
 *   without reporting it.
 * - A request is aborted after 10 seconds.
 * - After a 429 or 403 nothing is sent for a minute.
 * - A failed request finds nothing instead of rejecting, which the control
 *   does not handle, and is reported through onError.
 */
export class PoliteOpenStreetMapProvider extends OpenStreetMapProvider {
  private lastRequestAt = -Infinity;
  private backoffUntil = -Infinity;
  private inFlight: Promise<unknown> = Promise.resolve();
  private latestCall = 0;
  private cache = new Map<string, { results: SearchResults; at: number }>();

  constructor(
    options: ProviderOptions = {},
    private readonly callbacks: PoliteProviderOptions = {},
  ) {
    super(options);
  }

  async search(options: SearchArgument): Promise<SearchResults> {
    const key = normalize(options.query ?? '');
    if (!key) {
      return [];
    }
    const call = ++this.latestCall;
    const cached = this.fromCache(key);
    if (cached) {
      return this.found(cached, options.query);
    }
    await this.inFlight;
    const wait = this.lastRequestAt + MIN_REQUEST_INTERVAL_MS - Date.now();
    if (wait > 0) {
      await sleep(wait);
    }
    if (call !== this.latestCall) {
      return [];
    }
    // An identical search may have answered while this one waited.
    const answered = this.fromCache(key);
    if (answered) {
      return this.found(answered, options.query);
    }
    if (Date.now() < this.backoffUntil) {
      this.callbacks.onError?.(
        new GeocoderError('The geocoder asked us to slow down.'),
      );
      return [];
    }
    // Checked and started in one synchronous step, so no other call can slip
    // in between.
    this.lastRequestAt = Date.now();
    const request = this.request(options.query.trim());
    this.inFlight = request.catch(() => undefined);
    try {
      const results = await request;
      this.cache.delete(key);
      this.cache.set(key, { results, at: Date.now() });
      if (this.cache.size > CACHE_SIZE) {
        this.cache.delete(this.cache.keys().next().value);
      }
      return this.found(results, options.query);
    } catch (error) {
      const failure =
        error instanceof GeocoderError
          ? error
          : new GeocoderError(String(error?.message ?? error));
      if (failure.status === 429 || failure.status === 403) {
        this.backoffUntil = Date.now() + BACKOFF_MS;
      }
      this.callbacks.onError?.(failure);
      return [];
    }
  }

  /** leaflet-geosearch's own fetch takes no signal and ignores the status. */
  private async request(query: string): Promise<SearchResults> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(
        this.endpoint({ query, type: SEARCH_REQUEST }),
        { signal: controller.signal },
      );
      if (!response.ok) {
        throw new GeocoderError(
          `The geocoder answered ${response.status}.`,
          response.status,
        );
      }
      return this.parse({ data: await response.json() });
    } finally {
      clearTimeout(timer);
    }
  }

  private fromCache(key: string): SearchResults | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
      return undefined;
    }
    if (Date.now() - entry.at > CACHE_TTL_MS) {
      this.cache.delete(key);
      return undefined;
    }
    // Most recently used last, so the oldest is evicted first.
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.results;
  }

  private found(results: SearchResults, query: string): SearchResults {
    if (!results.length) {
      this.callbacks.onNoResults?.(query);
    }
    return results;
  }
}
