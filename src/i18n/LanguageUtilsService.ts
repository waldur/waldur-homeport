import Axios from 'axios';
import moment from 'moment-timezone';

import { ENV, ngInjector } from '@waldur/core/services';
import { LanguageOption } from '@waldur/core/types';

class LanguageUtilsServiceClass {
  currentLanguage: LanguageOption;

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  setCurrentLanguage(language: LanguageOption) {
    this.currentLanguage = language;
    ngInjector.get('$translate').use(language.code);
    moment.locale(language.code);
    Axios.defaults.headers.common['Accept-Language'] = language.code;
  }

  checkLanguage() {
    // Check if current language is listed in choices and
    // switch to default language if current choice is invalid.
    // Fallback to first option in languageChoices list if defaultLanguage is invalid.
    const key = ngInjector.get('$translate').storageKey();
    const storage = ngInjector.get('$translate').storage();
    const code = storage.get(key);
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
