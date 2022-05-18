import { AnyAction } from 'redux';

export interface Theme {
  theme: 'dark' | 'light';
}

export const ThemeAction = {
  UPDATE_THEME: 'UPDATE_THEME',
};

const INITIAL_STATE: Theme = {
  theme: 'dark',
};

export const updateThemeMode = (payload) => {
  return { type: ThemeAction.UPDATE_THEME, payload };
};

export const reducer = (state = INITIAL_STATE, action: AnyAction) => {
  switch (action.type) {
    case ThemeAction.UPDATE_THEME:
      return { theme: action.payload };
    default:
      return state;
  }
};
