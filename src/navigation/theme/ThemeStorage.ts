import { getItem, setItem } from '@waldur/auth/AuthStorage';

import { ThemeName } from './types';

const key = 'waldur/theme/name';

export const getTheme = () => getItem(key) as ThemeName;

export const setTheme = (value: ThemeName) => setItem(key, value);
