import { afterEach, describe, expect, it } from 'vitest';

import { getCssVar } from './cssVar';

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
