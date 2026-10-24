import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import {
  BACKOFF_MS,
  MIN_REQUEST_INTERVAL_MS,
  PoliteOpenStreetMapProvider,
  REQUEST_TIMEOUT_MS,
} from './politeProvider';

const place = (name: string) => ({
  lat: '59.43',
  lon: '24.75',
  display_name: name,
  boundingbox: ['59.4', '59.5', '24.7', '24.8'],
});

const respond = (body: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status }));

// The query Nominatim was asked for, from the request URL.
const askedFor = (call: unknown[]) =>
  new URL(String(call[0])).searchParams.get('q');

describe('PoliteOpenStreetMapProvider', () => {
  let fetchMock: Mock<typeof fetch>;
  let onNoResults: Mock<(query: string) => void>;
  let onError: Mock<(error: Error) => void>;
  let provider: PoliteOpenStreetMapProvider;

  beforeEach(() => {
    vi.useFakeTimers();
    fetchMock = vi.fn((url) =>
      respond([place(new URL(String(url)).searchParams.get('q'))]),
    );
    vi.stubGlobal('fetch', fetchMock);
    onNoResults = vi.fn();
    onError = vi.fn();
    provider = new PoliteOpenStreetMapProvider({}, { onNoResults, onError });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  const labels = (results) => results.map((result) => result.label);

  it('sends nothing for an empty or blank query', async () => {
    expect(await provider.search({ query: '' })).toEqual([]);
    expect(await provider.search({ query: '   ' })).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(onNoResults).not.toHaveBeenCalled();
  });

  it('sends one request for searches that arrive together, the newest', async () => {
    const searches = [
      provider.search({ query: 'Tallinn' }),
      provider.search({ query: 'Tartu' }),
      provider.search({ query: 'Narva' }),
    ];
    await vi.runAllTimersAsync();

    expect((await Promise.all(searches)).map(labels)).toEqual([
      [],
      [],
      ['Narva'],
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    // Superseded searches are not reported as finding nothing.
    expect(onNoResults).not.toHaveBeenCalled();
  });

  it('keeps a second between requests', async () => {
    await provider.search({ query: 'Tallinn' });
    const second = provider.search({ query: 'Tartu' });

    await vi.advanceTimersByTimeAsync(MIN_REQUEST_INTERVAL_MS - 1);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    expect(labels(await second)).toEqual(['Tartu']);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('waits for the request in flight before sending another', async () => {
    let answer: (response: Response) => void;
    fetchMock.mockImplementationOnce(
      () => new Promise((resolve) => (answer = resolve)),
    );

    const first = provider.search({ query: 'Tallinn' });
    await vi.advanceTimersByTimeAsync(0);
    const second = provider.search({ query: 'Tartu' });
    await vi.advanceTimersByTimeAsync(5 * MIN_REQUEST_INTERVAL_MS);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    answer(new Response(JSON.stringify([place('Tallinn')])));
    await vi.runAllTimersAsync();
    expect(labels(await first)).toEqual(['Tallinn']);
    expect(labels(await second)).toEqual(['Tartu']);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('answers a repeated search from its cache', async () => {
    await provider.search({ query: 'Tartu' });
    await vi.advanceTimersByTimeAsync(MIN_REQUEST_INTERVAL_MS);

    expect(labels(await provider.search({ query: '  tartu ' }))).toEqual([
      'Tartu',
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Until the entry expires.
    await vi.advanceTimersByTimeAsync(5 * 60_000 + 1);
    await provider.search({ query: 'Tartu' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('reports a search that finds nothing, also from the cache', async () => {
    fetchMock.mockImplementation(() => respond([]));

    expect(await provider.search({ query: 'Atlantis' })).toEqual([]);
    expect(await provider.search({ query: 'Atlantis' })).toEqual([]);
    expect(onNoResults).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
  });

  it('reports a failed request, finds nothing, and keeps searching', async () => {
    fetchMock.mockImplementationOnce(() =>
      Promise.reject(new TypeError('Failed to fetch')),
    );

    expect(await provider.search({ query: 'Tallinn' })).toEqual([]);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onNoResults).not.toHaveBeenCalled();

    const next = provider.search({ query: 'Tartu' });
    await vi.runAllTimersAsync();
    expect(labels(await next)).toEqual(['Tartu']);
  });

  it('aborts a request that does not answer, so later searches still run', async () => {
    fetchMock.mockImplementationOnce(
      (_url, { signal }) =>
        new Promise((_resolve, reject) =>
          signal.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError')),
          ),
        ),
    );

    const stuck = provider.search({ query: 'Tallinn' });
    await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS);
    expect(await stuck).toEqual([]);
    expect(onError).toHaveBeenCalledTimes(1);

    const next = provider.search({ query: 'Tartu' });
    await vi.runAllTimersAsync();
    expect(labels(await next)).toEqual(['Tartu']);
  });

  it.each([429, 403])('stops sending for a while after %s', async (status) => {
    fetchMock.mockImplementationOnce(() => respond({}, status));

    expect(await provider.search({ query: 'Tallinn' })).toEqual([]);
    expect(onError).toHaveBeenCalledTimes(1);

    const held = provider.search({ query: 'Tartu' });
    await vi.advanceTimersByTimeAsync(MIN_REQUEST_INTERVAL_MS);
    expect(await held).toEqual([]);
    expect(onError).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(BACKOFF_MS);
    const resumed = provider.search({ query: 'Narva' });
    await vi.runAllTimersAsync();
    expect(labels(await resumed)).toEqual(['Narva']);
    expect(askedFor(fetchMock.mock.calls[1])).toBe('Narva');
  });
});
