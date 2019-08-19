import { ENV } from '@waldur/core/services';
import { LATIN_NAME_PATTERN } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

export const required = value => value ? undefined :
  translate('This field is required.');

export const latinName = (value: string) => {
  if (value === undefined) {
    return undefined;
  }
  if (value.length < 2) {
    return translate('Name is too short, names should be at least two alphanumeric characters.');
  }
  if (!value.match(LATIN_NAME_PATTERN)) {
    return translate('Name should consist of latin symbols and numbers.');
  }
};

export const getLatinNameValidators = () => {
  const validators = [required];
  if (ENV.enforceLatinName) {
    validators.push(latinName);
  }
  return validators;
};
