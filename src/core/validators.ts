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
  value || [0, false].includes(value)
    ? undefined
    : translate('This field is required.');

export const requiredArray = (value) =>
  Array.isArray(value) && value.length
    ? undefined
    : translate('This field is required.');

export const lessThanOrEqual = (n) => (value: number) =>
  value && value > n ? translate('Must be {n} or less.', { n }) : undefined;

export const greaterThanOrEqual = (n) => (value: number) =>
  value && value < n ? translate('Must be {n} or greater.', { n }) : undefined;

export const greaterThan = (n) => (value: number) =>
  value && value <= n
    ? translate('Must be greater than {n}.', { n })
    : undefined;

/**
 * Type for cross-field attribute validators.
 * These validators compare values between different form fields.
 */
export interface AttributeValidator {
  type: 'gt'; // Can be extended: 'gte' | 'lt' | 'lte' | 'eq'
  target_field: string;
  source_field?: string; // Added by backend during processing
}

/**
 * Creates a validator that checks if the current field value is greater than
 * another field's value. Used for cross-field validation in marketplace options.
 *
 * @param targetField - The name of the field to compare against
 * @param allValues - All form values (typically from useFormState)
 * @param targetFieldLabel - Optional display label for the target field in error messages
 */
const createFieldValidator =
  (
    compareFn: (value: any, targetValue: any) => boolean,
    translator: (ctx: any) => string,
  ) =>
  (
    targetField: string,
    allValues: Record<string, any>,
    targetFieldLabel?: string,
  ) =>
  (value: any) => {
    const targetValue = allValues?.attributes?.[targetField];
    if (
      value !== undefined &&
      value !== null &&
      targetValue !== undefined &&
      targetValue !== null &&
      compareFn(value, targetValue)
    ) {
      return translator({
        fieldLabel: targetFieldLabel || targetField,
      });
    }
    return undefined;
  };

/**
 * Validates that a field's value is greater than another field's value. Used for cross-field validation in marketplace options.
 *
 * @param targetField - The name of the field to compare against
 * @param allValues - All form values (typically from useFormState)
 * @param targetFieldLabel - Optional display label for the target field in error messages
 */
export const greaterThanField = createFieldValidator(
  (value, targetValue) => value <= targetValue,
  (ctx) => translate('Must be greater than {fieldLabel}.', ctx),
);

/**
 * Validates that a field's value is greater than or equal to another field's value.
 */
export const greaterThanOrEqualField = createFieldValidator(
  (value, targetValue) => value < targetValue,
  (ctx) => translate('Must be greater than or equal to {fieldLabel}.', ctx),
);

/**
 * Validates that a field's value is less than another field's value.
 */
export const lessThanField = createFieldValidator(
  (value, targetValue) => value >= targetValue,
  (ctx) => translate('Must be less than {fieldLabel}.', ctx),
);

/**
 * Validates that a field's value is less than or equal to another field's value.
 */
export const lessThanOrEqualField = createFieldValidator(
  (value, targetValue) => value > targetValue,
  (ctx) => translate('Must be less than or equal to {fieldLabel}.', ctx),
);

export const max = (length) => (value) =>
  value && value.length > length
    ? translate('Must be {length} characters or less.', { length })
    : undefined;

/**
 * Validates that a string value does not exceed the specified maximum length.
 * Alias for max() with clearer naming convention.
 */
export const validateMaxLength = (maxLength: number) => (value: string) =>
  value && value.length > maxLength
    ? translate('Must be {max} characters or less.', { max: maxLength })
    : undefined;

/**
 * Validates that a number is positive (>= 0).
 */
export const positive = (value: number) =>
  value < 0 ? translate('Value must be positive') : undefined;

export const email = (value) =>
  value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)
    ? translate('Invalid email address')
    : undefined;

export const url = (value) => {
  if (!value) return undefined;

  // Early length check to avoid processing extremely long URLs
  if (value.length > 10000) {
    return translate('URL is too long');
  }

  try {
    // Fast string checks before regex
    if (value.indexOf('://') !== -1) {
      const protocol = value.substring(0, value.indexOf('://'));
      if (
        [
          'ftp',
          'file',
          'javascript',
          'data',
          'vbscript',
          'about',
          'blob',
        ].includes(protocol.toLowerCase())
      ) {
        throw new Error('Invalid protocol');
      }
    }

    // Reject protocol-relative URLs
    if (value.startsWith('//')) {
      throw new Error('Protocol-relative URLs not allowed');
    }

    // Use startsWith for performance instead of regex
    const urlToTest =
      value.startsWith('http://') || value.startsWith('https://')
        ? value
        : `https://${value}`;

    const urlObj = new URL(urlToTest);

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Invalid protocol');
    }

    // Check for valid hostname
    if (
      !urlObj.hostname ||
      urlObj.hostname.includes(' ') ||
      urlObj.hostname === '.' ||
      urlObj.hostname === '..'
    ) {
      throw new Error('Invalid hostname');
    }

    return undefined;
  } catch {
    return translate('Please enter a valid URL (e.g., https://example.com)');
  }
};

export const redirectURI = (value: string) => {
  // Empty is allowed
  if (!value || !value.trim()) {
    return undefined;
  }

  const trimmedUrl = value.trim();

  // Check if URL has scheme
  if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
    return translate('Missing http:// or https://');
  }

  // Check if URL is valid and origin-only (no paths, query, or fragments)
  try {
    const parsedUrl = new URL(trimmedUrl);

    // Enforce HTTPS except for localhost
    if (
      parsedUrl.protocol !== 'https:' &&
      parsedUrl.hostname !== 'localhost' &&
      parsedUrl.hostname !== '127.0.0.1'
    ) {
      return translate('Must use HTTPS (unless localhost)');
    }

    // Check for trailing slash
    if (trimmedUrl.endsWith('/')) {
      return translate('No trailing slashes allowed');
    }

    // Check for paths, query parameters, or fragments
    if (parsedUrl.pathname !== '/' || parsedUrl.search || parsedUrl.hash) {
      return translate('Must be origin-only (no paths, query, or fragments)');
    }
  } catch {
    return translate('Invalid URL format');
  }

  return undefined;
};

export const validateRedirectURLs = (
  value: string | string[] | null | undefined,
) => {
  // Empty is allowed (means allow all domains)
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  // Convert to array if needed
  let urlArray: string[] = [];

  if (Array.isArray(value)) {
    urlArray = value;
  } else if (typeof value === 'string' && value.trim()) {
    urlArray = [value];
  } else {
    return undefined; // Empty is allowed
  }

  if (urlArray.length === 0) {
    return undefined; // Empty is allowed (means allow all domains)
  }

  const errors: string[] = [];

  urlArray.forEach((url, index) => {
    const error = redirectURI(url);
    if (error) {
      errors.push(
        translate('URL {index}: {error}', {
          index: index + 1,
          error,
        }),
      );
    }
  });

  if (errors.length > 0) {
    return errors.join('; ');
  }

  return undefined;
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
