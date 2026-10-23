import { translate } from 'waldur-i18n-runtime';

export const required = (value: any) =>
  value || [0, false].includes(value)
    ? undefined
    : translate('This field is required.');
