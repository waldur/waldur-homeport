import { describe, expect, it } from 'vitest';

import { formatOptionValue, OptionValue } from './OptionValue';

const MULTI = { type: 'select_string_multi', label: 'Models' } as any;

describe('OptionValue', () => {
  it('reads a multiple choice of every model, none or some', () => {
    expect(OptionValue({ option: MULTI, value: ['*'] })).toBe('All models');
    expect(OptionValue({ option: MULTI, value: [] })).toBe('None');
    expect(OptionValue({ option: MULTI, value: ['a', 'b'] })).toBe('a, b');
  });
});

describe('formatOptionValue', () => {
  it('spells a value as plain text', () => {
    expect(
      formatOptionValue({ type: 'select_string' } as any, 'parallel'),
    ).toBe('parallel');
    expect(formatOptionValue({ type: 'boolean' } as any, true)).toBe('Yes');
    expect(formatOptionValue(MULTI, ['a', 'b'])).toBe('a, b');
    expect(formatOptionValue({ type: 'integer' } as any, 0)).toBe('0');
  });

  // A PDF cannot render markup.
  it('strips the markup of an HTML text', () => {
    expect(
      formatOptionValue({ type: 'html_text' } as any, '<p>Use <b>GPUs</b></p>'),
    ).toBe('Use GPUs');
  });

  // Block ends become spaces, or the lines would run together.
  it('keeps the lines of an HTML text apart', () => {
    expect(
      formatOptionValue(
        { type: 'html_text' } as any,
        '<p>Line one</p><p>Line two</p><ul><li>a</li><li>b</li></ul>x<br>y',
      ),
    ).toBe('Line one Line two a b x y');
  });

  it('decodes the entities of an HTML text', () => {
    expect(
      formatOptionValue({ type: 'html_text' } as any, '<p>R&amp;D</p>'),
    ).toBe('R&D');
  });

  // Stored values do not always have the shape their option says.
  it('reads a multiple choice stored as one value', () => {
    expect(formatOptionValue(MULTI, 'a')).toBe('a');
  });

  it('leaves an empty multiple choice out', () => {
    expect(formatOptionValue(MULTI, [])).toBeNull();
  });

  it('has nothing to show for an empty value', () => {
    expect(formatOptionValue({ type: 'string' } as any, '')).toBeNull();
    expect(formatOptionValue({ type: 'string' } as any, '  ')).toBeNull();
    expect(
      formatOptionValue({ type: 'html_text' } as any, '<p></p>'),
    ).toBeNull();
    expect(formatOptionValue({ type: 'string' } as any, undefined)).toBeNull();
  });
});
