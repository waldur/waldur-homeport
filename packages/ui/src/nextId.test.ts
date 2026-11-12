import { describe, expect, it } from 'vitest';

import { nextId } from './nextId';

describe('nextId', () => {
  it('puts the prefix before a number', () => {
    expect(nextId('booking')).toMatch(/^booking\d+$/);
    expect(nextId()).toMatch(/^\d+$/);
  });

  it('never repeats, across prefixes', () => {
    const ids = [nextId('a'), nextId('b'), nextId('a'), nextId()];
    const numbers = ids.map((id) => id.replace(/^\D*/, ''));
    expect(new Set(numbers).size).toBe(ids.length);
  });
});
