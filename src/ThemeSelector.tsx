import { FunctionComponent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '@waldur/store/reducers';

import { updateThemeMode } from './navigation/header/store';

export const ThemeSelector: FunctionComponent = () => {
  const { theme } = useSelector((state: RootState) => state.theme);
  const dispatch = useDispatch();
  useEffect(() => {
    const themeMode = localStorage.getItem('themeMode');
    if (themeMode) {
      dispatch(updateThemeMode(themeMode));
      return;
    }
    const isDark = window.matchMedia('(prefers-color-scheme:dark)').matches;
    const currentTheme = isDark ? 'dark' : 'light';
    dispatch(updateThemeMode(currentTheme));
    localStorage.setItem('themeMode', 'light');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      require('@waldur/metronic/assets/sass/style.dark.scss');
      require('flatpickr/dist/themes/dark.css');
    } else {
      require('@waldur/metronic/assets/sass/style.scss');
      require('flatpickr/dist/themes/light.css');
    }
  }, [theme]);
  return <></>;
};
