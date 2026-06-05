import { describe, expect, it } from 'vitest';

import { resolveInitialTab } from './resolveInitialTab';

const base = {
  storedTab: 'ai' as const,
  hasRoomDeepLink: false,
  showAI: true,
  showMatrix: true,
};

describe('resolveInitialTab', () => {
  it('forces the matrix tab for a room deep-link', () => {
    expect(
      resolveInitialTab({ ...base, hasRoomDeepLink: true, storedTab: 'ai' }),
    ).toBe('matrix');
  });

  it('ignores a deep-link when matrix is not visible', () => {
    expect(
      resolveInitialTab({
        ...base,
        hasRoomDeepLink: true,
        showMatrix: false,
      }),
    ).toBe('ai');
  });

  it('restores the stored tab when its feature is visible', () => {
    expect(resolveInitialTab({ ...base, storedTab: 'matrix' })).toBe('matrix');
    expect(resolveInitialTab({ ...base, storedTab: 'ai' })).toBe('ai');
  });

  it('falls back to the only visible feature when the stored tab is hidden', () => {
    expect(
      resolveInitialTab({ ...base, storedTab: 'matrix', showMatrix: false }),
    ).toBe('ai');
    expect(resolveInitialTab({ ...base, storedTab: 'ai', showAI: false })).toBe(
      'matrix',
    );
  });
});
