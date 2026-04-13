/**
 * Lightweight localStorage cache for OpenPortal report data.
 *
 * All entries are versioned — bumping CACHE_VERSION invalidates everything.
 * setCached silently drops data when the storage quota is exceeded so callers
 * never need to handle errors.
 */

import { DateTime } from 'luxon';

import { translate } from '@waldur/i18n';

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

/**
 * Persist data under `key`. Silently ignores QuotaExceededError so callers
 * never need to handle storage failures.
 */
export function setCached(key: string, data: unknown): void {
  try {
    const entry: CacheEntry<unknown> = { data, cachedAt: Date.now() };
    localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(entry));
  } catch {
    // Storage quota exceeded or serialisation error — continue without caching.
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
