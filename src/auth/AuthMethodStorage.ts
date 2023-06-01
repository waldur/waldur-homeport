import { getItem, removeItem, setItem } from './AuthStorage';

const key = 'waldur/auth/method';

export const setAuthenticationMethod = (value: string) => setItem(key, value);

export const resetAuthenticationMethod = () => removeItem(key);

export const getAuthenticationMethod = () => getItem(key);
