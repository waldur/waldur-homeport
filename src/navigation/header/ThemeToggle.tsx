import { MoonIcon, SunIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { IconButton } from 'waldur-ui';

import { ENV } from '@/core/config';
import { translate } from '@/i18n';
import { useTheme } from '@/theme/useTheme';

/**
 * The sign-in strip's ThemeSwitcherButton in the app header's own button
 * style, next to the other header toggles.
 */
export const ThemeToggle: FunctionComponent = () => {
  const { theme, toggleTheme } = useTheme();

  if (ENV.plugins.WALDUR_CORE.DISABLE_DARK_THEME) {
    return null;
  }

  const label =
    theme === 'dark'
      ? translate('Switch to light mode')
      : translate('Switch to dark mode');

  return (
    <div className="flex items-center ms-[0.25rem]">
      <IconButton
        label={label}
        onClick={toggleTheme}
        icon={
          theme === 'dark' ? (
            <SunIcon weight="bold" />
          ) : (
            <MoonIcon weight="bold" />
          )
        }
      />
    </div>
  );
};
