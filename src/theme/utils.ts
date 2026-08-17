import { ENV } from '@/core/config';

import * as ThemeStorage from './ThemeStorage';
import { ThemeName } from './types';

const hrefs = {
  dark: () => import('@/metronic/sass/style.dark.scss?url'),
  light: () => import('@/metronic/sass/style.scss?url'),
};

let styleTag: HTMLLinkElement;

export function loadTheme(theme: ThemeName) {
  if (!styleTag) {
    styleTag = document.createElement('link');
    styleTag.rel = 'stylesheet';
    styleTag.type = 'text/css';
    styleTag.crossOrigin = '';
    document.head.appendChild(styleTag);
  }
  hrefs[theme]().then((url) => {
    styleTag.href = url.default as string;
  });
  // Mirrors the active theme onto the DOM so consumers that can't read
  // ThemeContext (CSS, e.g. Tailwind's dark: variant in the migration spike)
  // still have a signal to key off. The stylesheet swap above remains the
  // source of truth for existing Bootstrap/Metronic styling.
  document.documentElement.setAttribute('data-theme', theme);
}

/** Get initial theme from local storage or user preference */
export const getInitialTheme = () => {
  if (ENV.plugins?.WALDUR_CORE.DISABLE_DARK_THEME) {
    return 'light';
  }
  if (hrefs[ThemeStorage.getTheme()]) {
    return ThemeStorage.getTheme();
  }
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};
