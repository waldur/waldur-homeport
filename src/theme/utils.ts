import { ENV } from '@/core/config';

import * as ThemeStorage from './ThemeStorage';
import { ThemeName } from './types';

const THEMES: ThemeName[] = ['light', 'dark'];

let styleTag: HTMLLinkElement;

/**
 * Applies a theme. The Metronic stylesheet is one file for both themes: its
 * colours read the design tokens, and the few dark-only rules key off
 * data-theme (the dark-theme mixin), like Tailwind's dark: variant. So
 * switching theme is just this attribute; the stylesheet is injected once.
 */
export function loadTheme(theme: ThemeName) {
  if (!styleTag) {
    styleTag = document.createElement('link');
    styleTag.rel = 'stylesheet';
    styleTag.type = 'text/css';
    styleTag.crossOrigin = '';
    document.head.appendChild(styleTag);
    import('@/styles/bootstrap/index.scss?url').then((url) => {
      styleTag.href = url.default as string;
    });
  }
  document.documentElement.setAttribute('data-theme', theme);
}

export const applyTheme = loadTheme;

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
