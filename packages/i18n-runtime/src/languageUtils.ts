import { Settings } from 'luxon';

import { toCanonicalLocale } from './loadSharedLocale';
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

  private loading: Promise<void> = Promise.resolve();

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
    this.loading = this.config.loadLocale(language.code).then(
      (mod) => {
        this.dictionary = mod.default;
      },
      // A locale that fails to load leaves the previous dictionary in place,
      // as before; whenLoaded() still settles.
      () => undefined,
    );
    Settings.defaultLocale = toDateLocale(language.code);
  }

  /** Settles once the current language's dictionary has loaded (or failed to). */
  whenLoaded() {
    return this.loading;
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
    return this.config?.languageChoices ?? [];
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

/**
 * The locale dates are formatted in for a UI language. Plain English becomes
 * en-GB so dates read day-first (26 Feb 2027) rather than the US month-first
 * order; every other language keeps its own conventions, grammatical case
 * included. Luxon, the date-fns calendar and any direct Intl call all take
 * their locale from here, so a date reads the same wherever it is drawn.
 */
// getDateLocale() runs for every formatted date (every table cell), so the
// canonicalisation is done once per language code.
const dateLocaleCache = new Map<string, string>();

export const toDateLocale = (code?: string): string => {
  if (!code) {
    return 'en-GB';
  }
  let locale = dateLocaleCache.get(code);
  if (!locale) {
    const canonical = toCanonicalLocale(code);
    locale = canonical === 'en' ? 'en-GB' : canonical;
    dateLocaleCache.set(code, locale);
  }
  return locale;
};

/** The date locale for the current UI language (en-GB before one is set). */
export const getDateLocale = (): string =>
  toDateLocale(LanguageUtilsService.getCurrentLanguage()?.code);

export const numberFormatter = new Intl.NumberFormat(getUserLocale(), {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
