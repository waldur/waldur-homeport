import { ENV } from '@waldur/configs/default';

const getStorage = (): Storage => {
  if (ENV.authStorage === 'localStorage') {
    return localStorage;
  } else if (ENV.authStorage === 'sessionStorage') {
    return sessionStorage;
  } else {
    throw new Error(
      `Invalid authStorage value: ${ENV.authStorage}. Either localStorage or sessionStorage is expected.`,
    );
  }
};

export const removeItem = (key: string): void => getStorage().removeItem(key);

export const getItem = (key: string): string => getStorage().getItem(key);

export const setItem = (key: string, value: string) =>
  getStorage().setItem(key, value);
