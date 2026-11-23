import { MoonIcon, SunIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { BaseButton, Menu, SwitchVisual } from 'waldur-ui';

import { translate } from '@/i18n';
import { useTheme } from '@/theme/useTheme';

/**
 * The user menu's dark-theme row: a button with role="switch" and
 * aria-checked, showing a switch. Choosing it keeps the menu open, so the
 * change can be seen.
 */
export const ThemeSwitcher: FunctionComponent = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Menu.Item
      role="switch"
      aria-checked={isDark}
      className="gap-[7.15px]"
      onSelect={(event) => {
        event.preventDefault();
        toggleTheme();
      }}
    >
      <SwitchVisual checked={isDark} />
      {translate('Dark theme')}
    </Menu.Item>
  );
};

export const ThemeSwitcherButton: FunctionComponent = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <BaseButton
      variant="tertiary"
      onClick={toggleTheme}
      tooltip={
        isDark
          ? translate('Switch to light mode')
          : translate('Switch to dark mode')
      }
      iconNode={
        isDark ? (
          <SunIcon size={20} weight="bold" />
        ) : (
          <MoonIcon size={20} weight="bold" />
        )
      }
    />
  );
};
