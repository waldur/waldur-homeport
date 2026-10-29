import { ENV } from '@/core/config';

import * as ThemeStorage from './ThemeStorage';
import { ThemeName } from './types';

const THEMES: ThemeName[] = ['light', 'dark'];

/**
 * Applies a theme. The Bootstrap stylesheet (imported once, from the entry
 * module) is one file for both themes: its colours read the design tokens,
 * and the few dark-only rules key off data-theme (the dark-theme mixin), like
 * Tailwind's dark: variant.
 */
export function applyTheme(theme: ThemeName) {
  document.documentElement.setAttribute('data-theme', theme);
}

/** Get initial theme from local storage or user preference */
export const getInitialTheme = () => {
  if (ENV.plugins?.WALDUR_CORE.DISABLE_DARK_THEME) {
    return 'light';
  }
  if (THEMES.includes(ThemeStorage.getTheme())) {
    return ThemeStorage.getTheme();
  }
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};
