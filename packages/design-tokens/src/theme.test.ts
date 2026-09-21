import { afterEach, describe, expect, it } from 'vitest';

import { applyTheme, getAppliedTheme, isDarkTheme } from './theme';

const root = document.documentElement;

afterEach(() => {
  root.removeAttribute('data-theme');
});

describe('getAppliedTheme / isDarkTheme', () => {
  it('is light before any theme is applied', () => {
    expect(getAppliedTheme()).toBe('light');
    expect(isDarkTheme()).toBe(false);
  });

  it('reads back what applyTheme wrote', () => {
    applyTheme('dark');
    expect(getAppliedTheme()).toBe('dark');
    expect(isDarkTheme()).toBe(true);

    applyTheme('light');
    expect(getAppliedTheme()).toBe('light');
    expect(isDarkTheme()).toBe(false);
  });

  it('treats an unknown value as light', () => {
    root.setAttribute('data-theme', 'sepia');
    expect(getAppliedTheme()).toBe('light');
  });

  it('can read another element', () => {
    const el = document.createElement('div');
    applyTheme('dark', el);
    expect(isDarkTheme(el)).toBe(true);
    expect(isDarkTheme()).toBe(false);
  });
});
