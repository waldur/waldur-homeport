import { describe, expect, it } from 'vitest';

import { LanguageCountry } from './LanguageSelectorDropdown';

// The backend (waldur-core/server/base_settings.py LANGUAGES) is the source of
// truth for which languages can reach the selector. Every one of them needs a
// LanguageCountry entry, otherwise CountryFlagIcon gets an undefined code.
const BACKEND_LANGUAGE_CODES = [
  'en',
  'et',
  'lt',
  'lv',
  'ru',
  'it',
  'de',
  'da',
  'sv',
  'es',
  'fr',
  'nb',
  'ar',
  'cs',
  'hr',
  'sl',
  'el',
  'bg',
  'km',
  'mk',
  'sq',
];

describe('LanguageCountry', () => {
  it.each(BACKEND_LANGUAGE_CODES)('maps %s to a country code', (code) => {
    expect(LanguageCountry[code]).toBeTruthy();
  });
});
