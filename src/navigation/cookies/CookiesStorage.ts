import { getItem, setItem } from '@waldur/auth/AuthStorage';

const key = 'hideCookiesConsent';

export const setConsent = (value: string) => setItem(key, value);

export const getConsent = () => getItem(key);
