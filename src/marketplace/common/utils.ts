import { translate } from '@waldur/i18n';

// See also: https://github.com/erikras/redux-form/issues/1852
export const parseIntField = value => parseInt(value, 10) || 0;
export const formatIntField = value => value ? value.toString() : 0;
export const validateNonNegative = value => value < 0 ? translate('Value should not be negative.') : undefined;
