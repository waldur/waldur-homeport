import { Settings } from 'luxon';

import { ENV } from '@waldur/core/config';
import { LanguageStorage } from '@waldur/core/StorageManager';
import { LanguageOption } from '@waldur/core/types';

function getLocaleData(locale) {
  return import(`../../locales/${locale}.json`);
}

/**
 * Returns the current user locale.
 * Priority: 1. Application-selected language, 2. Browser language, 3. Default 'en'.
 */
export const getUserLocale = (): string => {
  return (
    LanguageUtilsService.getCurrentLanguage()?.code ||
    navigator.language ||
    'en'
  );
};

class LanguageUtilsServiceClass {
  currentLanguage: LanguageOption;

  dictionary: Record<string, string> = {};

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  setCurrentLanguage(language: LanguageOption) {
    this.currentLanguage = language;
    LanguageStorage.set(language.code);
    getLocaleData(language.code).then((mod) => {
      this.dictionary = mod.default;
    });
    Settings.defaultLocale = language.code;
  }

  checkLanguage() {
    // Check if current language is listed in choices and
    // switch to default language if current choice is invalid.
    // Fallback to first option in languageChoices list if defaultLanguage is invalid.
    // Priority: URL param (?language=xx) > localStorage > defaultLanguage > first choice
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('language');
    const storedLang = LanguageStorage.get();

    const current =
      this.findLanguageByCode(urlLang) ||
      this.findLanguageByCode(storedLang) ||
      this.findLanguageByCode(ENV.defaultLanguage) ||
      this.getChoices()[0];
    this.setCurrentLanguage(current);
  }

  findLanguageByCode(code?: string) {
    if (!code) {
      return;
    }
    return this.getChoices().filter((language) => language.code === code)[0];
  }

  getChoices() {
    return ENV.languageChoices;
  }
}

export const LanguageUtilsService = new LanguageUtilsServiceClass();
