import Axios from 'axios';
import moment from 'moment-timezone';

import { ENV } from '@waldur/configs/default';
import { LanguageOption } from '@waldur/core/types';

function getLocaleData(locale) {
  return import(`json-loader!po-loader?format=mf!../../locales/${locale}.po`);
}

class LanguageUtilsServiceClass {
  currentLanguage: LanguageOption;
  dictionary: Record<string, string> = {};

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  setCurrentLanguage(language: LanguageOption) {
    this.currentLanguage = language;
    localStorage.setItem('NG_TRANSLATE_LANG_KEY', language.code);
    getLocaleData(language.code).then((mod) => {
      this.dictionary = mod.default;
    });
    moment.locale(language.code);
    Axios.defaults.headers.common['Accept-Language'] = language.code;
  }

  checkLanguage() {
    // Check if current language is listed in choices and
    // switch to default language if current choice is invalid.
    // Fallback to first option in languageChoices list if defaultLanguage is invalid.
    const code = localStorage.getItem('NG_TRANSLATE_LANG_KEY');
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
