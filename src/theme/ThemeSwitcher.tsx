import { MoonIcon, SunIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { AwesomeCheckbox } from '@/core/AwesomeCheckbox';
import { translate } from '@/i18n';
import { useTheme } from '@/theme/useTheme';

/**
 * Rendered as plain content inside UserDropdown's NavMenuContent, not
 * wrapped in NavMenuItem: it holds a real checkbox the user toggles
 * in place, and Radix's Item defaults to closing the menu on selection —
 * exactly the opposite of what a persistent settings toggle wants.
 */
export const ThemeSwitcher: FunctionComponent = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="menu-item">
      <div className="menu-link bg-transparent">
        <AwesomeCheckbox
          label={translate('Dark theme')}
          value={theme === 'dark'}
          onChange={toggleTheme}
          className="align-items-center"
        />
      </div>
    </div>
  );
};

export const ThemeSwitcherButton: FunctionComponent = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className="btn btn-text-secondary btn-icon"
      onClick={toggleTheme}
      title={
        isDark
          ? translate('Switch to light mode')
          : translate('Switch to dark mode')
      }
    >
      {isDark ? (
        <SunIcon size={20} weight="bold" />
      ) : (
        <MoonIcon size={20} weight="bold" />
      )}
    </button>
  );
};
