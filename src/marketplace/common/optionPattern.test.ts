import { describe, expect, it } from 'vitest';

import {
  compileOptionPattern,
  getOptionPatternValidator,
  isValidOptionPattern,
} from './optionPattern';

const slug = {
  type: 'string',
  pattern: '[a-z][a-z0-9-]{2,30}',
  pattern_error: 'Lowercase letters, digits and dashes.',
};

describe('compileOptionPattern', () => {
  it('matches the whole value, like Python fullmatch', () => {
    const regexp = compileOptionPattern('[a-z]+');
    expect(regexp.test('abc')).toBe(true);
    expect(regexp.test('abc1')).toBe(false);
    expect(regexp.test('1abc')).toBe(false);
  });

  it('anchors every alternative', () => {
    const regexp = compileOptionPattern('a|b');
    expect(regexp.test('a')).toBe(true);
    expect(regexp.test('ab')).toBe(false);
  });

  it('matches word and digit classes in ASCII only, like mastermind', () => {
    expect(compileOptionPattern('\\w+').test('cheese')).toBe(true);
    expect(compileOptionPattern('\\w+').test('käse')).toBe(false);
    expect(compileOptionPattern('\\d').test('٣')).toBe(false);
  });

  it('treats an astral character as one character', () => {
    expect(compileOptionPattern('.').test('😀')).toBe(true);
  });

  it('returns null for a pattern only Python compiles', () => {
    expect(compileOptionPattern('a++')).toBeNull();
  });

  it('returns null for an empty or invalid pattern', () => {
    expect(compileOptionPattern('')).toBeNull();
    expect(compileOptionPattern(undefined)).toBeNull();
    expect(compileOptionPattern('[a-z')).toBeNull();
    expect(isValidOptionPattern('(unclosed')).toBe(false);
  });
});

describe('getOptionPatternValidator', () => {
  it('accepts a matching value', () => {
    expect(getOptionPatternValidator(slug)('my-project')).toBeUndefined();
  });

  it('shows the provider message for a value that does not match', () => {
    expect(getOptionPatternValidator(slug)('My Project')).toBe(
      'Lowercase letters, digits and dashes.',
    );
  });

  it('names the pattern when the provider gave no message', () => {
    const validator = getOptionPatternValidator({ ...slug, pattern_error: '' });
    expect(validator('My Project')).toContain(slug.pattern);
  });

  it('does not trim the value before matching', () => {
    expect(getOptionPatternValidator(slug)(' my-project')).toBeDefined();
  });

  it('leaves empty values to the required check', () => {
    const validator = getOptionPatternValidator(slug);
    expect(validator('')).toBeUndefined();
    expect(validator(undefined)).toBeUndefined();
  });

  it('checks text options too', () => {
    const validator = getOptionPatternValidator({
      type: 'text',
      pattern: '[^<>]*',
    });
    expect(validator('<script>')).toBeDefined();
  });

  it('ignores patterns on other types and patterns the browser cannot compile', () => {
    expect(
      getOptionPatternValidator({ type: 'integer', pattern: '[a-z]+' }),
    ).toBeUndefined();
    expect(
      getOptionPatternValidator({ type: 'string', pattern: '(?P<name>x)' }),
    ).toBeUndefined();
    expect(getOptionPatternValidator({ type: 'string' })).toBeUndefined();
  });
});
