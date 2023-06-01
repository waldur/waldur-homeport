import { getItem, removeItem, setItem } from './AuthStorage';

const key = 'waldur/auth/token';

export const removeToken = () => removeItem(key);

export const getToken = () => getItem(key);

export const setToken = (value: string) => setItem(key, value);
