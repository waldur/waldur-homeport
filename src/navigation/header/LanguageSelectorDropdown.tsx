import classNames from 'classnames';
import { FunctionComponent } from 'react';

import { CountryFlagIcon } from '@waldur/core/CountryFlagIcon';
import { translate } from '@waldur/i18n';
import { useLanguageSelector } from '@waldur/i18n/useLanguageSelector';

export const LanguageCountry = {
  ar: 'sa',
  en: 'gb',
  et: 'ee',
  lt: 'lt',
  lv: 'lv',
  ru: 'ru',
  it: 'it',
  de: 'de',
  da: 'dk',
  sv: 'se',
  es: 'es',
  fr: 'fr',
  nb: 'no',
  cs: 'cz',
};

export const LanguageSelectorDropdown: FunctionComponent = () => {
  const { currentLanguage, languageChoices, setLanguage } =
    useLanguageSelector();

  return (
    <div
      className="menu-item"
      data-kt-menu-trigger="hover"
      data-kt-menu-placement="left-start"
      data-kt-menu-flip="bottom"
    >
      <div className="menu-link">
        <span className="menu-title position-relative">
          {translate('Language')}
          <span className="d-flex flex-center gap-2 fs-8 rounded bg-light px-3 py-1 position-absolute translate-middle-y top-50 end-0">
            {currentLanguage.label}{' '}
            <CountryFlagIcon
              countryCode={LanguageCountry[currentLanguage.code]}
              size="sm"
            />
          </span>
        </span>
      </div>

      <div className="menu-sub menu-sub-dropdown w-175px py-4">
        {languageChoices.map((language) => (
          <div
            className="menu-item"
            key={language.code}
            data-kt-menu-trigger="click"
            aria-hidden="true"
            onClick={() => {
              setLanguage(language);
            }}
          >
            <div
              className={classNames('menu-link d-flex', {
                active: language.code === currentLanguage.code,
              })}
            >
              <span className="symbol symbol-20px me-4">
                <CountryFlagIcon countryCode={LanguageCountry[language.code]} />
              </span>
              {language.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
