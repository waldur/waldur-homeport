import { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';

import { updateThemeMode } from './store';
import { setTheme } from './ThemeStorage';

export const ThemeSwitcher: FunctionComponent = () => {
  const { theme } = useSelector((state: RootState) => state.theme);
  const dispatch = useDispatch();
  const handleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    dispatch(updateThemeMode(newTheme));
  };

  return (
    <div className="menu-item px-5" data-kt-menu-trigger="click">
      <div className="px-5 menu-link">
        <AwesomeCheckbox
          label={translate('Dark theme')}
          value={theme === 'dark'}
          onChange={handleTheme}
        />
      </div>
    </div>
  );
};
