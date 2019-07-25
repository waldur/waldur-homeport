import { translate } from '@waldur/i18n';

// See also: https://github.com/erikras/redux-form/issues/1852
export const parseIntField = value => parseInt(value, 10) || 0;
export const formatIntField = value => value ? value.toString() : 0;
export const validateNonNegative = value => value < 0 ? translate('Value should not be negative.') : undefined;

export const maxAmount = limit => value =>
  parseInt(value, 10) > parseInt(limit, 10) ? translate('Value should not be greater than {limit}.', {limit}) : undefined;

export const minAmount = limit => value =>
  parseInt(value, 10) < parseInt(limit, 10) ? translate('Value should not be lesser than {limit}.', {limit}) : undefined;
