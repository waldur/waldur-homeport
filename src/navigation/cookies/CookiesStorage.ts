import { getItem, setItem } from '@waldur/auth/AuthStorage';

const key = 'waldur/cookies/consent';

export const setConsent = (value: string) => setItem(key, value);

export const getConsent = () => getItem(key);
