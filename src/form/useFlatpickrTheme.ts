import flatpickr from 'flatpickr';
import { useEffect } from 'react';

import { LanguageUtilsService } from '@/i18n/LanguageUtilsService';
import { ThemeName } from '@/theme/types';
import { useTheme } from '@/theme/useTheme';

const hrefs = {
  dark: () => import('flatpickr/dist/themes/dark.css?url'),
  light: () => import('flatpickr/dist/themes/light.css?url'),
};

let styleTag: HTMLLinkElement;

function loadTheme(theme: ThemeName) {
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
