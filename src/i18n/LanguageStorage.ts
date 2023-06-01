import { getItem, setItem } from '@waldur/auth/AuthStorage';

const key = 'waldur/i18n/lang';

export const getLanguageKey = () => getItem(key);

export const setLanguageKey = (value: string) => setItem(key, value);
