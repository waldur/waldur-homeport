import { translate } from '@waldur/i18n';

export const validateRequired = (value: any) =>
  value ? undefined : translate('This field is required.');

export const validateMaxLength = (maxLength: number) => (value: string) =>
  value && value.length > maxLength
    ? translate('Value is too long (max {{maxLength}} characters)', {
        maxLength,
      })
    : undefined;

export const validatePositiveNumber = (value: number) =>
  value < 0 ? translate('Value must be positive') : undefined;

export const composeValidators =
  (...validators: Array<(value: any) => string | undefined>) =>
  (value: any) =>
    validators.reduce(
      (error, validator) => error || validator(value),
      undefined,
    );
