import { describe, expect, it } from 'vitest';

import { formatApiKeyCounts } from './ApiKeyCountsField';

describe('formatApiKeyCounts', () => {
  it('reads as nothing for a resource without keys', () => {
    expect(formatApiKeyCounts({})).toBeUndefined();
    expect(formatApiKeyCounts(undefined)).toBeUndefined();
  });

  it('counts every key it is given', () => {
    expect(formatApiKeyCounts({ OK: 3, Updating: 1 })).toBe('4');
  });

  it('notes the paused and erred keys', () => {
    expect(formatApiKeyCounts({ OK: 2, Paused: 1, Erred: 1 })).toBe(
      '4 · 1 paused · 1 erred',
    );
  });
});
