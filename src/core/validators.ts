import { ENV } from '@waldur/core/services';
import { LATIN_NAME_PATTERN } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

export const required = value => value ? undefined :
  translate('This field is required.');

const latinName = (value: string) =>
  value.length < 2 ? translate('Name is too short, names should be at least two alphanumeric characters.') :
  !value.match(LATIN_NAME_PATTERN) ? translate('Name should consist of latin symbols and numbers.') :
  undefined ;

export const getLatinNameValidators = () => {
  const validators = [required];
  if (ENV.enforceLatinName) {
    validators.push(latinName);
  }
  return validators;
};
