import { describe, expect, it } from 'vitest';

import { resolveTabValue } from './resolveTabValue';

describe('resolveTabValue', () => {
  it('keeps a requested value that can be shown', () => {
    expect(resolveTabValue(['a', 'b'], 'b')).toBe('b');
  });

  it('falls back to the first value when none is requested', () => {
    expect(resolveTabValue(['a', 'b'], undefined)).toBe('a');
  });

  it('falls back to the first value when the request cannot be shown', () => {
    expect(resolveTabValue(['a', 'b'], 'gone')).toBe('a');
  });

  it('is undefined when there is nothing to show', () => {
    expect(resolveTabValue([], 'a')).toBeUndefined();
  });
});
