import { Settings } from 'luxon';

import { LanguageOption } from './types';

export interface LanguageStorageAdapter {
  get(): string | null;
  set(value: string): void;
}

export interface LanguageUtilsConfig {
  languageChoices: LanguageOption[];
  defaultLanguage?: string;
  loadLocale: (code: string) => Promise<{ default: Record<string, string> }>;
  storage: LanguageStorageAdapter;
}

class LanguageUtilsServiceClass {
  private config: LanguageUtilsConfig;

  currentLanguage: LanguageOption;

  dictionary: Record<string, string> = {};

  /** Wires this singleton to a host app's config/storage. Must run before any other method. */
  init(config: LanguageUtilsConfig) {
    this.config = config;
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  setCurrentLanguage(language: LanguageOption) {
    this.currentLanguage = language;
    this.config.storage.set(language.code);
    this.config.loadLocale(language.code).then((mod) => {
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
    const storedLang = this.config.storage.get();

    const current =
      this.findLanguageByCode(urlLang) ||
      this.findLanguageByCode(storedLang) ||
      this.findLanguageByCode(this.config.defaultLanguage) ||
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
    return this.config.languageChoices;
  }
}

export const LanguageUtilsService = new LanguageUtilsServiceClass();

export const getUserLocale = (): string => {
  return (
    LanguageUtilsService.getCurrentLanguage()?.code ||
    navigator.language ||
    'en'
  );
};

export const numberFormatter = new Intl.NumberFormat(getUserLocale(), {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
