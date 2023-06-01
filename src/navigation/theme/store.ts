import { AnyAction } from 'redux';

import { getTheme, setTheme } from './ThemeStorage';
import { ThemeName } from './types';

export interface Theme {
  theme: ThemeName;
  themes: Record<ThemeName, string> | {};
}

export const ThemeAction = {
  UPDATE_THEME: 'UPDATE_THEME',
  ADD_THEME: 'ADD_THEME',
};

const getInitialTheme: any = () => {
  let currentTheme = getTheme();
  if (!currentTheme) {
    const isDarkPrefers = window.matchMedia(
      '(prefers-color-scheme:dark)',
    ).matches;
    currentTheme = isDarkPrefers ? 'dark' : 'light';
  }
  setTheme(currentTheme);
  return currentTheme;
};

const INITIAL_STATE: Theme = {
  theme: getInitialTheme(),
  themes: {},
};

export const updateThemeMode = (payload: ThemeName) => {
  return { type: ThemeAction.UPDATE_THEME, payload };
};
export const addTheme = (payload: Pick<Theme, 'themes'>) => {
  return { type: ThemeAction.ADD_THEME, payload };
};

export const reducer = (state = INITIAL_STATE, action: AnyAction) => {
  switch (action.type) {
    case ThemeAction.UPDATE_THEME:
      return { ...state, theme: action.payload };
    case ThemeAction.ADD_THEME:
      return { ...state, themes: action.payload };
    default:
      return state;
  }
};
