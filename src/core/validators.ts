import { ENV } from '@waldur/core/config';
import { LATIN_NAME_PATTERN } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

export const composeValidators =
  (...validators) =>
  (value) =>
    validators.reduce(
      (error, validator) => error || validator(value),
      undefined,
    );

const GUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isGuid = (value) => {
  if (value && !value.match(GUID_PATTERN)) {
    return translate('GUID is expected.');
  }
};

export const isMatchPattern =
  (regex: RegExp, message = translate('Please match the requested format.')) =>
  (value) => {
    if (value && !value.match(regex)) {
      return message;
    }
  };

export const required = (value) =>
  value || value === 0 ? undefined : translate('This field is required.');

export const requiredArray = (value) =>
  Array.isArray(value) && value.length
    ? undefined
    : translate('This field is required.');

export const number = (value) =>
  !value || !isNaN(value) ? undefined : translate('Must be a number.');

export const lessThanOrEqual = (n) => (value: number) =>
  value && value > n ? translate('Must be {n} or less.', { n }) : undefined;

export const greaterThan = (n) => (value: number) =>
  value && value <= n
    ? translate('Must be greater than {n}.', { n })
    : undefined;

export const max = (length) => (value) =>
  value && value.length > length
    ? translate('Must be {length} characters or less.', { length })
    : undefined;

export const email = (value) =>
  value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)
    ? translate('Invalid email address')
    : undefined;

export const url = (value) => {
  if (!value) return undefined;

  try {
    const urlPattern =
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
    const isValidPattern = urlPattern.test(value);

    if (isValidPattern) {
      // If no protocol is provided, assume https
      const urlToTest = value.startsWith('http') ? value : `https://${value}`;
      new URL(urlToTest);
    } else {
      throw new Error('Invalid URL format');
    }

    return undefined;
  } catch {
    return translate('Please enter a valid URL (e.g., https://example.com)');
  }
};

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
