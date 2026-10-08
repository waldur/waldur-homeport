import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  isLeavingForIdentityProvider,
  reloadAfterPreloadError,
  resetBootGuard,
} from './bootGuard';

function fakeWindow({
  bootRedirect,
  storage = 'memory',
}: {
  bootRedirect?: Promise<boolean>;
  storage?: 'memory' | 'throwing';
} = {}) {
  const values: Record<string, string> = {};
  const reload = vi.fn();
  const win: Record<string, unknown> = {
    location: { reload },
    waldurBootRedirect: bootRedirect,
  };
  if (storage === 'throwing') {
    Object.defineProperty(win, 'sessionStorage', {
      get() {
        throw new Error('blocked');
      },
    });
  } else {
    win.sessionStorage = {
      getItem: (key: string) => values[key] ?? null,
      setItem: (key: string, value: string) => {
        values[key] = value;
      },
    };
  }
  return { win: win as unknown as Window, reload };
}

describe('bootGuard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetBootGuard();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    ['boot-redirect did not run', undefined, false],
    ['the visitor stays', Promise.resolve(false), false],
    ['the visitor is sent to the provider', Promise.resolve(true), true],
  ])(
    'reports whether the page is leaving when %s',
    async (_l, decision, expected) => {
      const { win } = fakeWindow({ bootRedirect: decision });
      await expect(isLeavingForIdentityProvider(win)).resolves.toBe(expected);
    },
  );

  it('reloads once after a failed chunk', () => {
    const { win, reload } = fakeWindow();
    expect(reloadAfterPreloadError(win)).toBe(true);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('does not reload while the page is leaving for the provider', async () => {
    const { win, reload } = fakeWindow({ bootRedirect: Promise.resolve(true) });
    await isLeavingForIdentityProvider(win);
    expect(reloadAfterPreloadError(win)).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });

  it('does not reload again right after a reload', () => {
    const { win, reload } = fakeWindow();
    reloadAfterPreloadError(win);
    vi.advanceTimersByTime(5_000);
    expect(reloadAfterPreloadError(win)).toBe(false);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('reloads again once the last reload is long past', () => {
    const { win, reload } = fakeWindow();
    reloadAfterPreloadError(win);
    vi.advanceTimersByTime(11_000);
    expect(reloadAfterPreloadError(win)).toBe(true);
    expect(reload).toHaveBeenCalledTimes(2);
  });

  it('still reloads when storage is blocked', () => {
    const { win, reload } = fakeWindow({ storage: 'throwing' });
    expect(reloadAfterPreloadError(win)).toBe(true);
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
