const key = 'waldur/cookies/consent';

export const setConsent = (value: 'essential' | 'true') =>
  localStorage.setItem(key, value);

export const getConsent = () => localStorage.getItem(key);
