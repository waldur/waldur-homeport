import { MoonIcon, SunIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { useTheme } from '@/theme/useTheme';

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
