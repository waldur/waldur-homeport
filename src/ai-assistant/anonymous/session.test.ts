import { describe, it, expect, beforeEach, vi } from 'vitest';

let uuidCounter = 0;

vi.mock('@/core/utils', () => ({
  randomUUID: () => `fixed-uuid-${++uuidCounter}`,
}));

import { getAnonymousSessionId, resetAnonymousSession } from './session';

describe('getAnonymousSessionId', () => {
  beforeEach(() => {
    uuidCounter = 0;
    resetAnonymousSession();
    sessionStorage.clear();
  });

  it('creates an id on first call without persisting it to sessionStorage', () => {
    const id = getAnonymousSessionId();
    expect(id).toBe('fixed-uuid-1');
    expect(sessionStorage.length).toBe(0);
  });

  it('returns the same in-memory id on subsequent calls', () => {
    const first = getAnonymousSessionId();
    expect(getAnonymousSessionId()).toBe(first);
  });

  it('clears the in-memory id so the next call mints a fresh one', () => {
    expect(getAnonymousSessionId()).toBe('fixed-uuid-1');
    resetAnonymousSession();
    expect(getAnonymousSessionId()).toBe('fixed-uuid-2');
  });
});
