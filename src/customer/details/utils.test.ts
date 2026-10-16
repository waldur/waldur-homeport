import { describe, it, expect } from 'vitest';

import { serializeEmailList } from './utils';

describe('serializeEmailList', () => {
  it('joins an array of addresses into a comma-separated string', () => {
    expect(serializeEmailList(['a@example.org', 'b@example.org'])).toBe(
      'a@example.org,b@example.org',
    );
  });

  it('trims whitespace and drops empty entries', () => {
    expect(
      serializeEmailList([' a@example.org ', '', '   ', 'b@example.org']),
    ).toBe('a@example.org,b@example.org');
  });

  it('returns an empty string for an empty array', () => {
    expect(serializeEmailList([])).toBe('');
  });

  it('passes through an existing comma-separated string unchanged', () => {
    expect(serializeEmailList('a@example.org,b@example.org')).toBe(
      'a@example.org,b@example.org',
    );
  });

  it('returns undefined when the field is not present', () => {
    expect(serializeEmailList(undefined)).toBeUndefined();
  });
});
