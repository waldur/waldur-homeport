import { translate } from '@/i18n';

/**
 * String and text offering options can carry a `pattern`: a regular
 * expression the whole value must match, with an optional `pattern_error`
 * shown on mismatch. Mastermind is authoritative (`OptionPatternValidator`);
 * the order form repeats the check so the user sees it before submitting.
 */

/** Option types that may have a pattern; mirrors `PATTERN_FIELD_TYPES`. */
const PATTERN_FIELD_TYPES = ['string', 'text'];

/** Mirrors `MAX_PATTERN_LENGTH` in mastermind. */
export const MAX_PATTERN_LENGTH = 500;

export const isPatternFieldType = (type?: string) =>
  PATTERN_FIELD_TYPES.includes(type);

/**
 * The pattern anchored to match the whole value, as Python's `fullmatch`
 * does, or null when the browser cannot compile it. The `u` flag makes `.`
 * and quantifiers work on code points, as Python does; mastermind matches in
 * ASCII mode, so `\w`, `\d` and `\b` mean the same on both sides. Providers
 * are asked for syntax common to Python and JavaScript, so a pattern only
 * Python accepts (such as the possessive `a++`) is left to the backend rather
 * than blocking the form.
 */
export const compileOptionPattern = (pattern?: string): RegExp | null => {
  if (!pattern) {
    return null;
  }
  try {
    return new RegExp(`^(?:${pattern})$`, 'u');
  } catch {
    return null;
  }
};

/** Whether `pattern` compiles in the browser. */
export const isValidOptionPattern = (pattern: string) =>
  compileOptionPattern(pattern) !== null;

/**
 * Validator for an option with a pattern, or undefined when the option has
 * none. Empty values pass: `required` decides whether a value must be given.
 */
export const getOptionPatternValidator = (option: {
  type?: string;
  pattern?: string;
  pattern_error?: string;
}) => {
  if (!isPatternFieldType(option?.type)) {
    return undefined;
  }
  const regexp = compileOptionPattern(option.pattern);
  if (!regexp) {
    return undefined;
  }
  return (value: unknown) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    if (regexp.test(String(value))) {
      return undefined;
    }
    return (
      option.pattern_error ||
      translate('Value must match the pattern {pattern}.', {
        pattern: option.pattern,
      })
    );
  };
};
