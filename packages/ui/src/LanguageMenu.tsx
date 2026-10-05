import { LanguageOption, translate } from 'waldur-i18n-runtime';

import { getLanguageFlag } from './languageFlags';
import { Menu } from './Menu';

export type { LanguageOption };

export interface LanguageMenuProps {
  currentLanguage: LanguageOption;
  languageChoices: LanguageOption[];
  onLanguageChange: (language: LanguageOption) => void;
}

/**
 * The language row of the user menu, as in the main app's
 * LanguageSelectorDropdown.tsx: a "Language" row showing the current
 * language in a gray pill, opening a submenu of every language. The
 * current language is highlighted like the main app's current row, with
 * no check mark; Radix still gives each row role="menuitemradio" and
 * aria-checked.
 */
export function LanguageMenu({
  currentLanguage,
  languageChoices,
  onLanguageChange,
}: LanguageMenuProps) {
  return (
    <Menu.Sub>
      <Menu.SubTrigger>
        {translate('Language')}
        {/* gray-100, 11px, 3px x 10px, gap 6.5px, as the main app's pill. */}
        <span className="ms-auto flex items-center gap-[6.5px] rounded-lg bg-[var(--menu-item-light-bg)] px-[9.75px] py-[3.25px] text-[11.05px]">
          {currentLanguage.label}
          <span aria-hidden="true">
            {getLanguageFlag(currentLanguage.code)}
          </span>
        </span>
      </Menu.SubTrigger>
      <Menu.SubContent className="py-[12px] text-[14px] font-medium w-[175px]">
        <Menu.RadioGroup
          value={currentLanguage.code}
          onValueChange={(code) => {
            const language = languageChoices.find(
              (choice) => choice.code === code,
            );
            if (language) {
              onLanguageChange(language);
            }
          }}
        >
          {languageChoices.map((language) => (
            <Menu.RadioItem key={language.code} value={language.code}>
              {/* The main app's 20px flag with 13px after it. */}
              <span aria-hidden="true" className="me-[13px] w-[20px]">
                {getLanguageFlag(language.code)}
              </span>
              {language.label}
            </Menu.RadioItem>
          ))}
        </Menu.RadioGroup>
      </Menu.SubContent>
    </Menu.Sub>
  );
}
