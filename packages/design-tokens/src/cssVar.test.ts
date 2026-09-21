import { afterEach, describe, expect, it } from 'vitest';

import { DEFAULT_PRIMARY_COLORS } from './brandColors';
import { getBrandVar, getCssVar } from './cssVar';

const root = document.documentElement;

afterEach(() => {
  root.removeAttribute('style');
});

describe('getCssVar', () => {
  it('returns the trimmed value of a property set on <html>', () => {
    root.style.setProperty('--test-colour', '  #307300 ');
    expect(getCssVar('--test-colour')).toBe('#307300');
  });

  it('returns the fallback, or an empty string, when the property is unset', () => {
    expect(getCssVar('--test-missing')).toBe('');
    expect(getCssVar('--test-missing', '#d0d5dd')).toBe('#d0d5dd');
  });

  it('prefers the value over the fallback', () => {
    root.style.setProperty('--test-colour', '#307300');
    expect(getCssVar('--test-colour', '#000000')).toBe('#307300');
  });

  it('treats an empty value as unset', () => {
    root.style.setProperty('--test-empty', ' ');
    expect(getCssVar('--test-empty', '#fff')).toBe('#fff');
  });
});

describe('getBrandVar', () => {
  it('reads --waldur-brand-<step> from <html>', () => {
    root.style.setProperty('--waldur-brand-600', '#1570ef');
    expect(getBrandVar(600)).toBe('#1570ef');
  });

  it('falls back to the same step of the default ramp', () => {
    expect(getBrandVar(600)).toBe(DEFAULT_PRIMARY_COLORS[600]);
    expect(getBrandVar(50)).toBe(DEFAULT_PRIMARY_COLORS[50]);
  });

  it('falls back per step, not for the whole ramp', () => {
    root.style.setProperty('--waldur-brand-600', '#1570ef');
    expect(getBrandVar(600)).toBe('#1570ef');
    expect(getBrandVar(700)).toBe(DEFAULT_PRIMARY_COLORS[700]);
  });
});
