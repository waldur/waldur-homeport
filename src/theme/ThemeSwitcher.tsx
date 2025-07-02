import { FunctionComponent } from 'react';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { translate } from '@waldur/i18n';
import { useTheme } from '@waldur/theme/useTheme';

export const ThemeSwitcher: FunctionComponent = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="menu-item" data-kt-menu-trigger="click">
      <div className="menu-link bg-transparent">
        <AwesomeCheckbox
          label={translate('Dark theme')}
          value={theme === 'dark'}
          onChange={toggleTheme}
        />
      </div>
    </div>
  );
};
