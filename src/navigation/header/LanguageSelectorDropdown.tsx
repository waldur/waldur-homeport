import classNames from 'classnames';
import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { useLanguageSelector } from '@waldur/i18n/useLanguageSelector';

const LanguageCountry = {
  en: 'us',
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
};

export const LanguageSelectorDropdown: FunctionComponent = () => {
  const { currentLanguage, languageChoices, setLanguage } =
    useLanguageSelector();

  return (
    <>
      <div
        className="menu-item px-5"
        data-kt-menu-trigger="hover"
        data-kt-menu-placement="left-start"
        data-kt-menu-flip="bottom"
      >
        <a href="#" className="menu-link px-5">
          <span className="menu-title position-relative">
            {translate('Language')}
            <span className="fs-8 rounded bg-light px-3 py-2 position-absolute translate-middle-y top-50 end-0">
              {currentLanguage.label}{' '}
              <i className="f16">
                <i
                  className={`flag ${LanguageCountry[currentLanguage.code]}`}
                ></i>
              </i>
            </span>
          </span>
        </a>

        <div className="menu-sub menu-sub-dropdown w-175px py-4">
          {languageChoices.map((language) => (
            <div
              className="menu-item px-3"
              key={language.code}
              data-kt-menu-trigger="click"
              onClick={() => {
                setLanguage(language);
              }}
            >
              <a
                className={classNames('menu-link d-flex px-5', {
                  active: language.code === currentLanguage.code,
                })}
              >
                <span className="symbol symbol-20px me-4">
                  <i className="f16">
                    <i className={`flag ${LanguageCountry[language.code]}`}></i>
                  </i>
                </span>
                {language.label}
              </a>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
