import { getItem, removeItem, setItem } from './AuthStorage';

const key = 'waldur/auth/redirect';

export const setRedirect = (value) => setItem(key, JSON.stringify(value));

export const resetRedirect = () => removeItem(key);

export const getRedirect = () => {
  const value = getItem(key);
  if (value) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return;
    }
  }
};
