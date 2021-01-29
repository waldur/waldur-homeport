import { getItem, removeItem, setItem } from './AuthStorage';

const key = 'authenticationMethod';

export const setAuthenticationMethod = (value: string) => setItem(key, value);

export const resetAuthenticationMethod = () => removeItem(key);

export const getAuthenticationMethod = () => getItem(key);
