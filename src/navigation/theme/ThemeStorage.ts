import { getItem, setItem } from '@waldur/auth/AuthStorage';

import { ThemeName } from './types';

const key = 'waldur/theme/name';
const STORAGE_FOR_THEMES = 'localStorage';

export const getTheme = () => getItem(key, STORAGE_FOR_THEMES) as ThemeName;

export const setTheme = (value: ThemeName) =>
  setItem(key, value, STORAGE_FOR_THEMES);
