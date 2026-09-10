import { describe, expect, it } from 'vitest';

import {
  getLimitParser,
  getLimitStep,
  parseFloatOrNull,
  parseIntField,
  parseNumberField,
} from './utils';

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

describe('parseNumberField', () => {
  // react-final-form re-parses on every keystroke, so a parser that collapses
  // "0." to 0 makes a decimal point impossible to type at all.
  it('hands back a trailing separator so the point survives the keystroke', () => {
    expect(parseNumberField('0.')).toBe('0.');
  });

  it('types 0.1 one keystroke at a time', () => {
    expect(parseNumberField('0')).toBe(0);
    expect(parseNumberField('0.')).toBe('0.');
    expect(parseNumberField('0.1')).toBe(0.1);
  });

  // The keystroke that used to be swallowed. parseFloat('1.0') is 1, so the
  // input was re-rendered as "1" and the next digit landed against it -- an
  // intended 1.05 was entered, and priced, as 15.
  it('keeps a zero typed straight after the separator', () => {
    expect(parseNumberField('1.0')).toBe('1.0');
    expect(parseNumberField('0.0')).toBe('0.0');
  });

  it('types 1.05 one keystroke at a time', () => {
    expect(parseNumberField('1')).toBe(1);
    expect(parseNumberField('1.')).toBe('1.');
    expect(parseNumberField('1.0')).toBe('1.0');
    expect(parseNumberField('1.05')).toBe(1.05);
  });

  it('keeps a trailing zero in a longer fraction', () => {
    expect(parseNumberField('1.10')).toBe('1.10');
    expect(parseNumberField('1.100')).toBe('1.100');
  });

  it('stops being a string once the number is unambiguous', () => {
    expect(parseNumberField('1.01')).toBe(1.01);
    expect(parseNumberField('12.34')).toBe(12.34);
  });

  it('does not keep text that is not a number', () => {
    expect(parseNumberField('abc.0')).toBe(0);
    expect(parseNumberField('..0')).toBe(0);
  });

  it('accepts a comma as the decimal separator', () => {
    expect(parseNumberField('0,1')).toBe(0.1);
  });

  it.each([
    ['', 0],
    [null, 0],
    [undefined, 0],
    ['abc', 0],
  ])('falls back to 0 for %p', (value, expected) => {
    expect(parseNumberField(value)).toBe(expected);
  });
});

describe('getLimitParser', () => {
  // A component is whole-number only unless the provider says otherwise, so the
  // integer parser stays the default: it keeps the browser's own step
  // validation meaningful on inputs that can never need a fraction.
  it('is integer-only by default', () => {
    expect(getLimitParser({})).toBe(parseIntField);
    expect(getLimitParser({ limit_decimal_places: 0 })).toBe(parseIntField);
    expect(getLimitParser(undefined)).toBe(parseIntField);
  });

  it('parses decimals once the component declares precision', () => {
    expect(getLimitParser({ limit_decimal_places: 1 })).toBe(parseNumberField);
    expect(getLimitParser({ limit_decimal_places: 2 })).toBe(parseNumberField);
  });
});

describe('getLimitStep', () => {
  // Driven off the declared precision rather than "any", so a component that
  // accepts one place rejects a second in the browser instead of at the API.
  it.each([
    [undefined, 1],
    [0, 1],
    [1, 0.1],
    [2, 0.01],
  ])('is %p decimal places -> step %p', (places, expected) => {
    expect(getLimitStep({ limit_decimal_places: places })).toBe(expected);
  });

  it('is 1 when there is no component at all', () => {
    expect(getLimitStep(undefined)).toBe(1);
  });
});
