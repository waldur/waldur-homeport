import { ENV } from '@waldur/core/services';
import { LATIN_NAME_PATTERN } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

export const required = value => value ? undefined :
  translate('This field is required.');

const latinName = (value: string) => value.match(LATIN_NAME_PATTERN) ? undefined :
  translate('Name should consist of latin symbols and numbers.');

export const getLatinNameValidators = () => {
  const validators = [required];
  if (ENV.enforceLatinName) {
    validators.push(latinName);
  }
  return validators;
};
