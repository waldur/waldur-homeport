/**
 * Lightweight localStorage cache for OpenPortal report data.
 *
 * All entries are versioned — bumping CACHE_VERSION invalidates everything.
 * setCached evicts existing entries (largest first, oldest as a tiebreaker)
 * when the storage quota is exceeded, so callers never need to handle errors.
 */

import { DateTime } from 'luxon';

import { translate } from '@/i18n';

const CACHE_VERSION = 1;
const PREFIX = `openportal-v${CACHE_VERSION}-`;

/** TTL constants in milliseconds. */
export const TTL = {
  /** Report data is generated once per day — 24-hour TTL. */
  REPORTS: 24 * 60 * 60 * 1000,
  /** Project lists and accounting summaries — 1-hour TTL. */
  LISTS: 60 * 60 * 1000,
  /** Name mappings (offering / project / user) — 12-hour TTL. */
  MAPPINGS: 12 * 60 * 60 * 1000,
} as const;

interface CacheEntry<T> {
  data: T;
  cachedAt: number;
}

/** Any version's prefix: `openportal-v<N>-`. */
const ANY_VERSION_KEY = /^openportal-v\d+-/;

/** No reader accepts an entry older than the longest TTL. */
const MAX_TTL = Math.max(...Object.values(TTL));

/**
 * Remove entries no code will ever read again: those from another
 * CACHE_VERSION, and those older than the longest TTL. Bumping the version
 * only makes old entries invisible, and getCached only removes an expired
 * entry when the same key is asked for again, so without this both kinds sit
 * in localStorage forever, still consuming quota.
 */
(function purgeStaleEntries() {
  try {
    const now = Date.now();
    for (const key of Object.keys(localStorage)) {
      if (!ANY_VERSION_KEY.test(key)) continue;
      if (!key.startsWith(PREFIX)) {
        localStorage.removeItem(key);
        continue;
      }
      try {
        const raw = localStorage.getItem(key);
        const entry = raw ? (JSON.parse(raw) as CacheEntry<unknown>) : null;
        if (!entry || !(now - entry.cachedAt <= MAX_TTL)) {
          localStorage.removeItem(key);
        }
      } catch {
        // Malformed entry: nothing can read it.
        localStorage.removeItem(key);
      }
    }
  } catch {
    // localStorage unavailable: nothing to purge.
  }
})();

/**
 * Read a cached value. Returns null if the key is missing, expired, or
 * the stored JSON is malformed.
 */
export function getCached<T>(key: string, ttlMs: number): T | null {
  try {
    const raw = localStorage.getItem(`${PREFIX}${key}`);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (Date.now() - entry.cachedAt > ttlMs) {
      localStorage.removeItem(`${PREFIX}${key}`);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

/**
 * Return the timestamp at which the given key was cached, or null if absent.
 * Useful for displaying "loaded from cache X hours ago" notices.
 */
export function getCacheAge(key: string): Date | null {
  try {
    const raw = localStorage.getItem(`${PREFIX}${key}`);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<unknown>;
    return new Date(entry.cachedAt);
  } catch {
    return null;
  }
}

interface StoredEntryMeta {
  key: string;
  size: number;
  cachedAt: number;
}

function listEntries(excludeKey: string): StoredEntryMeta[] {
  const entries: StoredEntryMeta[] = [];
  for (const key of Object.keys(localStorage)) {
    if (!key.startsWith(PREFIX) || key === excludeKey) continue;
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    let cachedAt = 0;
    try {
      cachedAt = (JSON.parse(raw) as CacheEntry<unknown>).cachedAt ?? 0;
    } catch {
      // Malformed entry — treat as oldest so it's evicted first among ties.
    }
    entries.push({ key, size: raw.length, cachedAt });
  }
  return entries;
}

/** Bounds the eviction loop if quota can never be satisfied for a single write. */
const MAX_EVICTIONS = 50;

/**
 * Other cache entries in the order they are evicted: largest first, oldest
 * as a tiebreaker. Never includes `keepKey` (the entry being written).
 */
function evictionOrder(keepKey: string): string[] {
  return listEntries(keepKey)
    .sort((a, b) => b.size - a.size || a.cachedAt - b.cachedAt)
    .map((entry) => entry.key);
}

/**
 * Persist data under `key`. If the storage quota is exceeded, evicts other
 * cache entries (largest first, oldest as a tiebreaker) and retries, so
 * callers never need to handle storage failures.
 *
 * Eviction is what makes it safe to keep caching whole report payloads: a
 * large write pushes out the biggest stale entries rather than being dropped
 * itself, so the small per-identifier mapping entries survive.
 */
export function setCached(key: string, data: unknown): void {
  const fullKey = `${PREFIX}${key}`;
  try {
    const entry: CacheEntry<unknown> = { data, cachedAt: Date.now() };
    const serialized = JSON.stringify(entry);
    // The candidates are listed once, when the first write fails, and evicted
    // in that order until the write fits.
    let candidates: string[] | null = null;
    for (let attempt = 0; attempt <= MAX_EVICTIONS; attempt++) {
      try {
        localStorage.setItem(fullKey, serialized);
        return;
      } catch {
        candidates ??= evictionOrder(fullKey);
        const next = candidates.shift();
        if (next === undefined) return;
        localStorage.removeItem(next);
      }
    }
  } catch {
    // Serialisation error, or storage that cannot even be read (blocked
    // site data): continue without caching.
  }
}

/**
 * Remove specific cache keys, or (with no arguments) clear all openportal
 * cache entries.
 */
export function clearCached(...keys: string[]): void {
  if (keys.length === 0) {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k));
    return;
  }
  for (const key of keys) {
    localStorage.removeItem(`${PREFIX}${key}`);
  }
}

/**
 * Remove all per-identifier mapping cache entries (keys prefixed with
 * `map-`). Called by Refresh buttons so the next load re-fetches fresh
 * names from the API.
 */
export function clearMappingCache(): void {
  const mapPrefix = `${PREFIX}map-`;
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(mapPrefix))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}

/** Format a cache age for display, e.g. "3 hr ago". */
export function formatCacheAge(cachedAt: Date): string {
  return (
    DateTime.fromJSDate(cachedAt).toRelative({ style: 'short' }) ??
    translate('just now')
  );
}
