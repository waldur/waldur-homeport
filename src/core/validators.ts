import { ANY_VISIBLE_UNICODE_CHARACTERS } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

export const required = (value) =>
  value || value === 0 ? undefined : translate('This field is required.');

const nameField = (value: string) => {
  if (!value) {
    return undefined;
  }
  if (value.length < 2) {
    return translate(
      'Name is too short, names should be at least two alphanumeric characters.',
    );
  }
  if (value.match(ANY_VISIBLE_UNICODE_CHARACTERS)) {
    return translate('Name should not includes an invalid unicode character.');
  }
};

export const getNameFieldValidators = () => [required, nameField];

export const minValue = (min: number) => (value: number) =>
  value && value < min
    ? translate('Must be at least {min}', { min })
    : undefined;

export const maxValue = (max: number) => (value: number) =>
  value && value > max
    ? translate('Must be at most {max}', { max })
    : undefined;
