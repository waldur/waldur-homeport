import { describe, expect, it, vi } from 'vitest';

import { LanguageUtilsService } from './languageUtils';

const en = { code: 'en', label: 'English' };
const et = { code: 'et', label: 'Eesti' };
const languageChoices = [en, et];

const makeStorage = (initial: string | null = null) => {
  let value = initial;
  return {
    get: () => value,
    set: (v: string) => {
      value = v;
    },
  };
};

// vitest-location-mock resets window.location to a fresh mock before every
// test (see test/setupTests.js), so no manual save/restore is needed here.
const setUrlLanguage = (code: string | null) => {
  window.location.assign(code ? `?language=${code}` : '?');
};

describe('LanguageUtilsService.checkLanguage', () => {
  it('prefers the URL param over stored/default language', () => {
    setUrlLanguage('et');
    const loadLocale = vi.fn().mockResolvedValue({ default: {} });
    LanguageUtilsService.init({
      languageChoices,
      defaultLanguage: 'en',
      loadLocale,
      storage: makeStorage('en'),
    });
    LanguageUtilsService.checkLanguage();
    expect(LanguageUtilsService.getCurrentLanguage()).toEqual(et);
  });

  it('falls back to stored language when no URL param is set', () => {
    setUrlLanguage(null);
    const loadLocale = vi.fn().mockResolvedValue({ default: {} });
    LanguageUtilsService.init({
      languageChoices,
      defaultLanguage: 'en',
      loadLocale,
      storage: makeStorage('et'),
    });
    LanguageUtilsService.checkLanguage();
    expect(LanguageUtilsService.getCurrentLanguage()).toEqual(et);
  });

  it('falls back to the configured default language, then the first choice', () => {
    setUrlLanguage(null);
    const loadLocale = vi.fn().mockResolvedValue({ default: {} });
    LanguageUtilsService.init({
      languageChoices,
      defaultLanguage: 'et',
      loadLocale,
      storage: makeStorage(null),
    });
    LanguageUtilsService.checkLanguage();
    expect(LanguageUtilsService.getCurrentLanguage()).toEqual(et);

    LanguageUtilsService.init({
      languageChoices,
      defaultLanguage: 'not-a-real-code',
      loadLocale,
      storage: makeStorage(null),
    });
    LanguageUtilsService.checkLanguage();
    expect(LanguageUtilsService.getCurrentLanguage()).toEqual(en);
  });

  it('persists the resolved language and loads its locale data', async () => {
    setUrlLanguage(null);
    const storage = makeStorage(null);
    const loadLocale = vi.fn().mockResolvedValue({ default: { hi: 'tere' } });
    LanguageUtilsService.init({
      languageChoices,
      defaultLanguage: 'et',
      loadLocale,
      storage,
    });
    LanguageUtilsService.checkLanguage();
    expect(storage.get()).toBe('et');
    expect(loadLocale).toHaveBeenCalledWith('et');
    await vi.waitFor(() =>
      expect(LanguageUtilsService.dictionary).toEqual({ hi: 'tere' }),
    );
  });
});
