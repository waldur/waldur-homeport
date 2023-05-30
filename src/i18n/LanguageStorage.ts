import { getItem, setItem } from '@waldur/auth/AuthStorage';

const key = 'NG_TRANSLATE_LANG_KEY';

export const getLanguageKey = () => getItem(key);

export const setLanguageKey = (value: string) => setItem(key, value);
