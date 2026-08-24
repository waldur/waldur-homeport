import {
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from './DropdownMenu';
import { getLanguageFlag } from './languageFlags';

export interface LanguageOption {
  code: string;
  label: string;
}

export interface LanguageMenuProps {
  currentLanguage: LanguageOption;
  languageChoices: LanguageOption[];
  onLanguageChange: (language: LanguageOption) => void;
  /** Already translated by the caller — this package has no i18n
   * dependency of its own (same boundary CopyButton.tsx documents). */
  label: string;
}

/**
 * LanguageSelectorDropdown.tsx's real menu-item, as its own reusable
 * piece (previously baked directly into UserMenu.tsx) — a single
 * collapsed row (data-kt-menu-trigger="hover" there) showing the current
 * language, not a flat inline list. The full choice list lives in a
 * nested submenu, revealed on hover there / on click here (Radix has no
 * hover-trigger submenu mode). Selection uses real
 * role="menuitemradio"/aria-checked semantics — see DropdownMenu.tsx's
 * comment on RadioItem.
 */
export function LanguageMenu({
  currentLanguage,
  languageChoices,
  onLanguageChange,
  label,
}: LanguageMenuProps) {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        {label}
        <span className="ml-auto flex items-center gap-1.5 rounded bg-[var(--surface-hover-bg)] px-2 py-0.5 text-xs">
          {currentLanguage.label}
          <span aria-hidden="true">
            {getLanguageFlag(currentLanguage.code)}
          </span>
        </span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuRadioGroup
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
            <DropdownMenuRadioItem key={language.code} value={language.code}>
              <span aria-hidden="true">{getLanguageFlag(language.code)}</span>
              {language.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
