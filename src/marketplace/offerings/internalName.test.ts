import { describe, expect, it } from 'vitest';

import { cleanInternalName, INTERNAL_NAME_PATTERN } from './internalName';

describe('cleanInternalName', () => {
  it('returns an empty string for empty input', () => {
    expect(cleanInternalName('')).toBe('');
    expect(cleanInternalName(undefined as any)).toBe('');
  });

  it('lowercases and replaces whitespace with underscores', () => {
    expect(cleanInternalName('CPU hours')).toBe('cpu_hours');
  });

  it('trims surrounding whitespace', () => {
    expect(cleanInternalName('  Trim Me  ')).toBe('trim_me');
  });

  it('collapses repeated whitespace into a single underscore', () => {
    expect(cleanInternalName('multi   spaces')).toBe('multi_spaces');
  });

  it('treats hyphens as word separators (snake_case, not kebab-case)', () => {
    expect(cleanInternalName('node-hours')).toBe('node_hours');
  });

  it('drops characters outside the internal-name pattern', () => {
    expect(cleanInternalName('weird!!!name')).toBe('weirdname');
    expect(cleanInternalName('a@#b')).toBe('ab');
  });

  it('keeps slashes and colons as structural separators', () => {
    expect(cleanInternalName('scope/thing:sub')).toBe('scope/thing:sub');
  });

  it('strips leading and trailing underscores', () => {
    expect(cleanInternalName('  (CPU)!  ')).toBe('cpu');
  });

  it('lowercases mixed case', () => {
    expect(cleanInternalName('Mixed CASE 123')).toBe('mixed_case_123');
  });

  it('produces a value that passes the internal-name pattern', () => {
    const cleaned = cleanInternalName('Some Display Name! 42');
    expect(cleaned).toMatch(INTERNAL_NAME_PATTERN);
  });
});
