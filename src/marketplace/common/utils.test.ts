import { describe, expect, it } from 'vitest';

import { parseFloatOrNull } from './utils';

describe('parseFloatOrNull', () => {
  // The reason it exists next to parseIntField, which collapses 0 to a falsy
  // default: a price or amount of 0 is a real value the provider set.
  it('keeps 0 distinct from "not set"', () => {
    expect(parseFloatOrNull(0)).toBe(0);
    expect(parseFloatOrNull('0')).toBe(0);
    expect(parseFloatOrNull('0.00')).toBe(0);
  });

  it('parses numbers and numeric strings', () => {
    expect(parseFloatOrNull(12.5)).toBe(12.5);
    expect(parseFloatOrNull('12.5')).toBe(12.5);
    expect(parseFloatOrNull('0.12345')).toBe(0.12345);
  });

  it.each([[null], [undefined], ['']])('returns null for %p', (value) => {
    expect(parseFloatOrNull(value)).toBeNull();
  });

  it('returns null rather than NaN for unparseable input', () => {
    expect(parseFloatOrNull('abc')).toBeNull();
    expect(parseFloatOrNull({})).toBeNull();
  });
});
