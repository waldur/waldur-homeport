import classNames from 'classnames';
import { FunctionComponent } from 'react';

import { CountryFlagIcon } from '@/core/CountryFlagIcon';
import { translate } from '@/i18n';
import { useLanguageSelector } from '@/i18n/useLanguageSelector';
import {
  NavMenuItem,
  NavMenuSub,
  NavMenuSubContent,
  NavMenuSubTrigger,
} from '@/navigation/NavMenu';

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

// NavMenuSubContent's own `menu-gray-600 menu-state-bg-gray` below —
// not inherited from UserDropdown.tsx's outer NavMenuContent despite the
// visual JSX nesting: Radix portals this Content to document.body,
// breaking the CSS descendant-selector chain the menu-state-bg-gray
// mixins rely on. Without it, hover/[data-highlighted] and .active have
// no color styling at all here — reported live: the current language
// never highlighted, even though `active` was already applied correctly.
export const LanguageSelectorDropdown: FunctionComponent = () => {
  const { currentLanguage, languageChoices, setLanguage } =
    useLanguageSelector();

  if (!currentLanguage) {
    return null;
  }

  return (
    <NavMenuSub>
      <NavMenuSubTrigger>
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
      </NavMenuSubTrigger>

      <NavMenuSubContent
        placement="left-start"
        className="menu-gray-600 menu-state-bg-gray w-175px py-4"
      >
        {languageChoices.map((language) => (
          <NavMenuItem
            key={language.code}
            className={classNames('d-flex', {
              active: language.code === currentLanguage.code,
            })}
            onSelect={() => setLanguage(language)}
          >
            <span className="symbol symbol-20px me-4">
              <CountryFlagIcon countryCode={LanguageCountry[language.code]} />
            </span>
            {language.label}
          </NavMenuItem>
        ))}
      </NavMenuSubContent>
    </NavMenuSub>
  );
};
