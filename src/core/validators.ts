import { ENV } from '@waldur/configs/default';
import { LATIN_NAME_PATTERN } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

export const required = (value) =>
  value || value === 0 ? undefined : translate('This field is required.');

const latinName = (value: string) => {
  if (!value.match(LATIN_NAME_PATTERN)) {
    return translate('Name should consist of latin symbols and numbers.');
  }
};

const nameField = (value: string) => {
  if (!value) {
    return undefined;
  }
  if (value.length < 2) {
    return translate(
      'Name is too short, names should be at least two alphanumeric characters.',
    );
  }
};

export const getNameFieldValidators = () => [required, nameField];

export const getLatinNameValidators = () => {
  const validators = [...getNameFieldValidators()];
  if (ENV.enforceLatinName) {
    validators.push(latinName);
  }
  return validators;
};

export const minValue = (min: number) => (value: number) =>
  value && value < min
    ? translate('Must be at least {min}', { min })
    : undefined;

export const maxValue = (max: number) => (value: number) =>
  value && value > max
    ? translate('Must be at most {max}', { max })
    : undefined;
