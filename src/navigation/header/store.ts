import { AnyAction } from 'redux';

export interface Theme {
  theme: 'dark' | 'light';
  themes: Record<'dark' | 'light', string> | {};
}

export const ThemeAction = {
  UPDATE_THEME: 'UPDATE_THEME',
  ADD_THEME: 'ADD_THEME',
};

const getInitialTheme: any = () => {
  let currentTheme = localStorage.getItem('themeMode');
  if (!currentTheme) {
    const isDarkPrefers = window.matchMedia(
      '(prefers-color-scheme:dark)',
    ).matches;
    currentTheme = isDarkPrefers ? 'dark' : 'light';
  }
  localStorage.setItem('themeMode', currentTheme);
  return currentTheme;
};

const INITIAL_STATE: Theme = {
  theme: getInitialTheme(),
  themes: {},
};

export const updateThemeMode = (payload) => {
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
