import classNames from 'classnames';
import { FunctionComponent } from 'react';

import { Menu, MenuDisclosure } from 'waldur-ui';

import { CountryFlagIcon } from '@/core/CountryFlagIcon';
import { translate } from '@/i18n';
import { useLanguageSelector } from '@/i18n/useLanguageSelector';

export const LanguageCountry = {
  ar: 'sa',
  bg: 'bg',
  cs: 'cz',
  da: 'dk',
  de: 'de',
  el: 'gr',
  // en is US English; en-gb (enabled separately) gets the UK flag.
  en: 'us',
  'en-gb': 'gb',
  es: 'es',
  et: 'ee',
  fr: 'fr',
  hr: 'hr',
  it: 'it',
  km: 'kh',
  lt: 'lt',
  lv: 'lv',
  mk: 'mk',
  nb: 'no',
  ru: 'ru',
  sl: 'si',
  sq: 'al',
  sv: 'se',
  uk: 'ua',
};

/**
 * The user menu's language list: a section with a button per language in
 * a flyout.
 */
export const LanguageSelectorDropdown: FunctionComponent = () => {
  const { currentLanguage, languageChoices, setLanguage } =
    useLanguageSelector();

  if (!currentLanguage) {
    return null;
  }

  return (
    <MenuDisclosure.Section
      label={
        <span className="relative flex grow items-center">
          {translate('Language')}
          <span className="absolute end-0 top-1/2 flex -translate-y-1/2 items-center justify-center gap-[0.5rem] rounded-lg bg-tertiary px-[0.75rem] py-[0.25rem] text-xs dark:bg-quaternary">
            {currentLanguage.label}{' '}
            <CountryFlagIcon
              countryCode={LanguageCountry[currentLanguage.code]}
              size="sm"
            />
          </span>
        </span>
      }
      title={translate('Language')}
      backLabel={translate('Back')}
      contentClassName="font-medium w-[175px] py-[0.924rem]"
    >
      {languageChoices.map((language) => (
        <Menu.Item
          key={language.code}
          className={classNames({
            active: language.code === currentLanguage.code,
          })}
          aria-current={language.code === currentLanguage.code || undefined}
          onSelect={() => setLanguage(language)}
        >
          <span className="relative flex shrink-0 items-center me-[0.924rem]">
            <CountryFlagIcon countryCode={LanguageCountry[language.code]} />
          </span>
          {language.label}
        </Menu.Item>
      ))}
    </MenuDisclosure.Section>
  );
};
