import { MoonIcon, SunIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { FormCheck } from 'react-bootstrap';

import { BaseButton, Menu } from 'waldur-ui';

import { translate } from '@/i18n';
import { useTheme } from '@/theme/useTheme';

/**
 * The user menu's dark-theme toggle: a menuitemcheckbox, so arrow keys
 * reach it and a screen reader announces it as on or off. It shows the
 * app's Bootstrap switch, as a visual only: the row is the control, and
 * choosing it keeps the menu open.
 */
export const ThemeSwitcher: FunctionComponent = () => {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === 'dark';

  return (
    <Menu.CheckboxItem
      checked={dark}
      onCheckedChange={toggleTheme}
      indicator={null}
    >
      <span className="form-check form-check-custom form-switch form-check-solid align-items-center">
        {/* AwesomeCheckbox's markup, as a visual: not focusable, hidden
            from screen readers, and not a click target of its own. */}
        <FormCheck
          type="checkbox"
          checked={dark}
          readOnly
          tabIndex={-1}
          aria-hidden="true"
          className="pointer-events-none"
        />
        <FormCheck.Label>{translate('Dark theme')}</FormCheck.Label>
      </span>
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
