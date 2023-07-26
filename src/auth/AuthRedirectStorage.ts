import { getItem, removeItem, setItem } from './AuthStorage';

const key = 'waldur/auth/redirect';
const STORAGE_FOR_REDIRECTS = 'localStorage';

export const setRedirect = (value) =>
  setItem(key, JSON.stringify(value), STORAGE_FOR_REDIRECTS);

export const resetRedirect = () => removeItem(key, STORAGE_FOR_REDIRECTS);

export const getRedirect = () => {
  const value = getItem(key, STORAGE_FOR_REDIRECTS);
  if (value) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return;
    }
  }
};
