import flatpickr from 'flatpickr';
import { useEffect } from 'react';

import { LanguageUtilsService } from '@/i18n/LanguageUtilsService';
import { ThemeName } from '@/theme/types';
import { useTheme } from '@/theme/useTheme';

const hrefs = {
  dark: () => import('flatpickr/dist/themes/dark.css?url'),
  light: () => import('flatpickr/dist/themes/light.css?url'),
};

let styleTag: HTMLStyleElement;

// Imported into the `base` layer so the Metronic overrides in
// _flatpickr.scss (`@layer bootstrap`) win. Loaded unlayered, the theme beats
// every layered rule and leaves the calendar with a transparent background.
// `base` rather than a new layer: a layer first seen at runtime would rank
// above `bootstrap`. See src/tailwind.css.
function loadTheme(theme: ThemeName) {
  if (!styleTag) {
    styleTag = document.createElement('style');
    document.head.appendChild(styleTag);
  }
  hrefs[theme]().then((url) => {
    styleTag.textContent = `@import url("${url.default}") layer(base);`;
  });
}

export const useFlatpickrTheme = () => {
  // Initialize flatpickr with current language
  const language = LanguageUtilsService.getCurrentLanguage();
  flatpickr.localize(flatpickr.l10ns[language.code]);
  flatpickr.l10ns.default.firstDayOfWeek = 1; // Monday

  const { theme } = useTheme();
  useEffect(() => {
    loadTheme(theme);
  }, [theme]);
};
