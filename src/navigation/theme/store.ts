import { AnyAction } from 'redux';

import { ApplicationConfigurationOptions } from '@waldur/core/types';
import { RootState } from '@waldur/store/reducers';

import { getTheme, setTheme } from './ThemeStorage';
import { ThemeName } from './types';

interface Theme {
  theme: ThemeName;
  themes: Record<ThemeName, string> | {};
}

export const ThemeAction = {
  INIT_THEME: 'INIT_THEME',
  UPDATE_THEME: 'UPDATE_THEME',
  ADD_THEME: 'ADD_THEME',
};

const getInitialTheme = (config: ApplicationConfigurationOptions) => {
  const { plugins } = config;
  let currentTheme = getTheme();
  if (!currentTheme) {
    const isDarkPrefers = window.matchMedia(
      '(prefers-color-scheme:dark)',
    ).matches;
    currentTheme = isDarkPrefers ? 'dark' : 'light';
  }
  if (plugins.WALDUR_CORE.DISABLE_DARK_THEME) {
    currentTheme = 'light';
  }
  setTheme(currentTheme);
  return currentTheme;
};

const INITIAL_STATE: Theme = {
  theme: 'light',
  themes: {},
};

export const initTheme = (config: any) => ({
  type: ThemeAction.INIT_THEME,
  payload: config,
});
export const updateThemeMode = (payload: ThemeName) => {
  return { type: ThemeAction.UPDATE_THEME, payload };
};
export const addTheme = (payload: Pick<Theme, 'themes'>) => {
  return { type: ThemeAction.ADD_THEME, payload };
};

export const reducer = (state = INITIAL_STATE, action: AnyAction) => {
  switch (action.type) {
    case ThemeAction.INIT_THEME:
      return { ...state, theme: getInitialTheme(action.payload) };
    case ThemeAction.UPDATE_THEME:
      return { ...state, theme: action.payload };
    case ThemeAction.ADD_THEME:
      return { ...state, themes: action.payload };
    default:
      return state;
  }
};

export const themeSelector = (state: RootState): ThemeName => state.theme.theme;
