import classNames from 'classnames';
import { FunctionComponent } from 'react';

import { Menu } from 'waldur-ui';

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
  en: 'gb',
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

export const LanguageSelectorDropdown: FunctionComponent = () => {
  const { currentLanguage, languageChoices, setLanguage } =
    useLanguageSelector();

  if (!currentLanguage) {
    return null;
  }

  return (
    <Menu.Sub>
      <Menu.SubTrigger>
        <span className="relative flex grow items-center">
          {translate('Language')}
          <span className="d-flex flex-center gap-2 fs-8 rounded bg-light px-3 py-1 position-absolute translate-middle-y top-50 end-0">
            {currentLanguage.label}{' '}
            <CountryFlagIcon
              countryCode={LanguageCountry[currentLanguage.code]}
              size="sm"
            />
          </span>
        </span>
      </Menu.SubTrigger>

      <Menu.SubContent className="fw-bold w-175px py-4">
        {languageChoices.map((language) => (
          <Menu.Item
            key={language.code}
            className={classNames({
              active: language.code === currentLanguage.code,
            })}
            onSelect={() => setLanguage(language)}
          >
            <span className="symbol symbol-20px me-4">
              <CountryFlagIcon countryCode={LanguageCountry[language.code]} />
            </span>
            {language.label}
          </Menu.Item>
        ))}
      </Menu.SubContent>
    </Menu.Sub>
  );
};
