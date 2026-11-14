import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const DAY = 24 * 60 * 60 * 1000;

const entry = (data: unknown, cachedAt: number) =>
  JSON.stringify({ data, cachedAt });

/** Load the module afresh, so its load-time purge runs against localStorage. */
const loadCache = () => {
  vi.resetModules();
  return import('./localStorageCache');
};

/**
 * Make localStorage behave as if it were full: a write throws
 * QuotaExceededError while the stored characters plus the new value exceed
 * `limit`.
 */
const realGetItem = Storage.prototype.getItem;

const withQuota = (limit: number) => {
  const realSetItem = Storage.prototype.setItem;
  return vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (
    this: Storage,
    key: string,
    value: string,
  ) {
    let used = 0;
    for (let i = 0; i < this.length; i++) {
      const k = this.key(i);
      if (k !== key) used += realGetItem.call(this, k).length;
    }
    if (used + value.length > limit) {
      throw new DOMException('quota exceeded', 'QuotaExceededError');
    }
    return realSetItem.call(this, key, value);
  });
};

describe('localStorageCache', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe('load-time purge', () => {
    it('removes entries left behind by another cache version', async () => {
      localStorage.setItem(
        'openportal-v0-project-usage-x',
        entry(1, Date.now()),
      );
      localStorage.setItem('openportal-v7-map-y', entry(2, Date.now()));

      await loadCache();

      expect(localStorage.getItem('openportal-v0-project-usage-x')).toBeNull();
      expect(localStorage.getItem('openportal-v7-map-y')).toBeNull();
    });

    it('removes current entries older than the longest TTL', async () => {
      localStorage.setItem('openportal-v1-old', entry(1, Date.now() - 2 * DAY));
      localStorage.setItem('openportal-v1-fresh', entry(2, Date.now()));

      const cache = await loadCache();

      expect(localStorage.getItem('openportal-v1-old')).toBeNull();
      expect(cache.getCached('fresh', DAY)).toBe(2);
    });

    it('leaves keys that are not OpenPortal cache entries alone', async () => {
      localStorage.setItem('openportal-visible-columns', 'keep');
      localStorage.setItem('unrelated', 'keep');

      await loadCache();

      expect(localStorage.getItem('openportal-visible-columns')).toBe('keep');
      expect(localStorage.getItem('unrelated')).toBe('keep');
    });
  });

  describe('setCached when storage is full', () => {
    it('evicts other entries, largest first, instead of dropping the write', async () => {
      const cache = await loadCache();
      cache.setCached('big', 'x'.repeat(600));
      cache.setCached('small', 'y');
      withQuota(800);

      cache.setCached('fresh', 'z'.repeat(300));

      expect(cache.getCached('fresh', DAY)).toBe('z'.repeat(300));
      expect(cache.getCached('big', DAY)).toBeNull();
      expect(cache.getCached('small', DAY)).toBe('y');
    });

    it('does not throw when nothing can be evicted', async () => {
      const cache = await loadCache();
      localStorage.setItem('unrelated', 'u'.repeat(500));
      withQuota(500);

      expect(() => cache.setCached('fresh', 'z')).not.toThrow();
      expect(cache.getCached('fresh', DAY)).toBeNull();
      expect(localStorage.getItem('unrelated')).toBe('u'.repeat(500));
    });

    it('lists the eviction candidates once, not once per eviction', async () => {
      const cache = await loadCache();
      cache.setCached('big', 'x'.repeat(500));
      cache.setCached('bigger', 'x'.repeat(600));
      cache.setCached('small', 'y');
      withQuota(800);
      const reads = vi.spyOn(Storage.prototype, 'getItem');

      cache.setCached('fresh', 'z'.repeat(300));

      // One read per other entry: big, bigger, small.
      expect(reads).toHaveBeenCalledTimes(3);
      reads.mockRestore();
      expect(cache.getCached('fresh', DAY)).toBe('z'.repeat(300));
      expect(cache.getCached('bigger', DAY)).toBeNull();
      expect(cache.getCached('big', DAY)).toBeNull();
      expect(cache.getCached('small', DAY)).toBe('y');
    });

    // With site data blocked, reading storage throws as well as writing it.
    it('does not throw when storage cannot be read', async () => {
      const cache = await loadCache();
      cache.setCached('old', 'x'.repeat(100));
      withQuota(0);
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new DOMException('blocked', 'SecurityError');
      });

      expect(() => cache.setCached('fresh', 'z')).not.toThrow();
    });
  });
});
