import { ENV } from '@waldur/configs/default';

type CustomStorage = 'localStorage' | 'sessionStorage';

const getStorage = (customStorage?: CustomStorage): Storage => {
  const selectedStorage = customStorage || ENV.authStorage;

  if (selectedStorage === 'localStorage') {
    return localStorage;
  } else if (selectedStorage === 'sessionStorage') {
    return sessionStorage;
  } else {
    throw new Error(
      `Invalid authStorage value: ${selectedStorage}. Either localStorage or sessionStorage is expected.`,
    );
  }
};

export const removeItem = (
  key: string,
  customStorage?: CustomStorage,
): void => {
  getStorage(customStorage).removeItem(key);
};

export const getItem = (key: string, customStorage?: CustomStorage): string => {
  return getStorage(customStorage).getItem(key);
};

export const setItem = (
  key: string,
  value: string,
  customStorage?: CustomStorage,
) => {
  getStorage(customStorage).setItem(key, value);
};
