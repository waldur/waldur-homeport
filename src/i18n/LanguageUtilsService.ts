import {
  LanguageUtilsService,
  getUserLocale,
  numberFormatter,
} from 'waldur-i18n-runtime';

import { ENV } from '@/core/config';
import { LanguageStorage } from '@/core/StorageManager';

export { LanguageUtilsService, getUserLocale, numberFormatter };

function getLocaleData(locale: string) {
  return import(`../../locales/${locale}.json`);
}

/** Wires the shared i18n runtime to this app's ENV/storage. Call once before checkLanguage(). */
export function initLanguageUtils() {
  LanguageUtilsService.init({
    languageChoices: ENV.languageChoices,
    defaultLanguage: ENV.defaultLanguage,
    loadLocale: getLocaleData,
    storage: LanguageStorage,
  });
}
