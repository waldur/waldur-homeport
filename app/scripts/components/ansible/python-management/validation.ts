import { translate } from '@waldur/i18n';

export const validateVirtualEnvironmentDirectory = (value, _, __) =>
  value && /^[a-zA-Z0-9\-_]+$/.test(value)
    ? undefined
    : translate('Only alphanumeric characters, dashes or underscores');

export function isNotBlank(username) {
  return username && !/^\s*$/.test(username);
}

export function isBlank(username) {
  return !isNotBlank(username);
}
