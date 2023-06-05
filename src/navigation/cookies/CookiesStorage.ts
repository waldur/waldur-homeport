import { getItem, removeItem, setItem } from '@waldur/auth/AuthStorage';

const key = 'waldur/cookies/consent';

export const setConsent = (value: string) => setItem(key, value);

export const resetConsent = () => removeItem(key);

export const getConsent = () => getItem(key);
