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
