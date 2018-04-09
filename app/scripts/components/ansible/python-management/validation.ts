import { translate } from '@waldur/i18n';

export const validateVirtualEnvironmentDirectory = (value, _, __) =>
  value && /^[a-zA-Z0-9\-_]+$/.test(value)
    ? undefined
    : translate('Only alphanumeric characters, dashes or underscores');
