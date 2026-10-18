import { afterEach, describe, expect, it } from 'vitest';

import { LanguageUtilsService } from './languageUtils';
import { loadSharedLocale, toCanonicalLocale } from './loadSharedLocale';
import { translate } from './translate';

describe('loadSharedLocale', () => {
  afterEach(() => {
    LanguageUtilsService.dictionary = {};
  });

  it('loads a regional catalog from the lowercase code the backend sends', async () => {
    const { default: dictionary } = await loadSharedLocale('en-gb');
    expect(dictionary['Organization']).toBe('Organisation');
  });

  it('falls back to the US source string where British English spells it the same', async () => {
    LanguageUtilsService.dictionary = (await loadSharedLocale('en-gb')).default;
    expect(translate('Synchronize')).toBe('Synchronise');
    expect(translate('Cancel')).toBe('Cancel');
  });
});

describe('toCanonicalLocale', () => {
  it('canonicalises the case of a regional code', () => {
    expect(toCanonicalLocale('en-gb')).toBe('en-GB');
    expect(toCanonicalLocale('et')).toBe('et');
  });

  it('returns an invalid tag unchanged instead of throwing', () => {
    expect(toCanonicalLocale('en_GB')).toBe('en_GB');
  });
});
