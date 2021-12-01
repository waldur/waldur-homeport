import Axios from 'axios';
import { Settings } from 'luxon';

import { ENV } from '@waldur/configs/default';
import { LanguageOption } from '@waldur/core/types';

import { getLanguageKey, setLanguageKey } from './LanguageStorage';

function getLocaleData(locale) {
  return import(`../../locales/${locale}.po`);
}

class LanguageUtilsServiceClass {
  currentLanguage: LanguageOption;
  dictionary: Record<string, string> = {};

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  setCurrentLanguage(language: LanguageOption) {
    this.currentLanguage = language;
    setLanguageKey(language.code);
    getLocaleData(language.code).then((mod) => {
      this.dictionary = mod.default;
    });
    Settings.defaultLocale = language.code;
    Axios.defaults.headers.common['Accept-Language'] = language.code;
  }

  checkLanguage() {
    // Check if current language is listed in choices and
    // switch to default language if current choice is invalid.
    // Fallback to first option in languageChoices list if defaultLanguage is invalid.
    const code = getLanguageKey();
    const current =
      this.findLanguageByCode(code) ||
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
