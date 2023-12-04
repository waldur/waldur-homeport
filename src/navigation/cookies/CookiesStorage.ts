import { getItem, setItem } from '@waldur/auth/AuthStorage';

const key = 'waldur/cookies/consent';
const STORAGE_FOR_COOKIES_CONSENT = 'localStorage';

export const setConsent = (value: string) =>
  setItem(key, value, STORAGE_FOR_COOKIES_CONSENT);

export const getConsent = () => getItem(key, STORAGE_FOR_COOKIES_CONSENT);
