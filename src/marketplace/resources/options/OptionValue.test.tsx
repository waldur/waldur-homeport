import { describe, expect, it } from 'vitest';

import { OptionValue } from './OptionValue';

const MULTI = { type: 'select_string_multi', label: 'Models' } as any;

describe('OptionValue', () => {
  it('reads a multiple choice of every model, none or some', () => {
    expect(OptionValue({ option: MULTI, value: ['*'] })).toBe('All models');
    expect(OptionValue({ option: MULTI, value: [] })).toBe('None');
    expect(OptionValue({ option: MULTI, value: ['a', 'b'] })).toBe('a, b');
  });
});
