import { MoonIcon, SunIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { BaseButton, Menu } from 'waldur-ui';

import { translate } from '@/i18n';
import { useTheme } from '@/theme/useTheme';

/**
 * The user menu's dark-theme toggle: a menuitemcheckbox, so arrow keys
 * reach it and a screen reader announces it as on or off. It shows the
 * menu's own switch (SwitchVisual), as a visual only: the row is the
 * control, and choosing it keeps the menu open.
 */
export const ThemeSwitcher: FunctionComponent = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Menu.CheckboxItem checked={theme === 'dark'} onCheckedChange={toggleTheme}>
      {translate('Dark theme')}
    </Menu.CheckboxItem>
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
