import { translate } from '@/i18n';

/**
 * String and text offering options can carry a `transform`: a prefix, a
 * suffix and a case applied to the value before mastermind stores it
 * (`transform_option_value`). The order form shows the result as a preview,
 * so the user sees the name that will be created.
 */

export interface OptionTransform {
  prefix?: string;
  suffix?: string;
  case?: 'lower' | 'upper';
}

/** Option types that may have a transform; mirrors `TRANSFORM_FIELD_TYPES`. */
const TRANSFORM_FIELD_TYPES = ['string', 'text'];

/** Mirrors `MAX_TRANSFORM_AFFIX_LENGTH` in mastermind. */
export const MAX_TRANSFORM_AFFIX_LENGTH = 100;

export const isTransformFieldType = (type?: string) =>
  TRANSFORM_FIELD_TYPES.includes(type);

/** The option's transform, or undefined when it has none that applies. */
export const getOptionTransform = (option: {
  type?: string;
  transform?: OptionTransform | null;
}): OptionTransform | undefined => {
  const transform = option?.transform;
  if (!isTransformFieldType(option?.type) || !transform) {
    return undefined;
  }
  return transform.prefix || transform.suffix || transform.case
    ? transform
    : undefined;
};

/**
 * The part of a value the user typed, without the prefix and suffix.
 * Mirrors `strip_option_affixes`: a stored value comes back already
 * transformed when an order or resource is edited. With a case set, the user
 * may type the prefix in either case, so the affixes are matched ignoring case.
 */
export const stripOptionAffixes = (
  transform: OptionTransform,
  value: string,
) => {
  const prefix = transform.prefix || '';
  const suffix = transform.suffix || '';
  const fold = (text: string) => (transform.case ? text.toLowerCase() : text);
  if (prefix && fold(value.slice(0, prefix.length)) === fold(prefix)) {
    value = value.slice(prefix.length);
  }
  if (
    suffix &&
    value.length >= suffix.length &&
    fold(value.slice(value.length - suffix.length)) === fold(suffix)
  ) {
    value = value.slice(0, value.length - suffix.length);
  }
  return value;
};

/**
 * The value mastermind stores for a submitted one; mirrors
 * `transform_option_value`. The case applies only to the part the user
 * typed: the prefix and suffix are kept as written.
 */
export const transformOptionValue = (
  transform: OptionTransform,
  value: string,
) => {
  value = stripOptionAffixes(transform, value);
  if (transform.case === 'lower') {
    value = value.toLowerCase();
  } else if (transform.case === 'upper') {
    value = value.toUpperCase();
  }
  return `${transform.prefix || ''}${value}${transform.suffix || ''}`;
};

/**
 * A value made only of the prefix and suffix leaves nothing typed, which
 * mastermind rejects as blank.
 */
export const getOptionTransformValidator = (option: {
  type?: string;
  transform?: OptionTransform | null;
}) => {
  const transform = getOptionTransform(option);
  if (!transform || (!transform.prefix && !transform.suffix)) {
    return undefined;
  }
  return (value: unknown) =>
    typeof value === 'string' &&
    value !== '' &&
    stripOptionAffixes(transform, value) === ''
      ? translate('Enter a value besides the prefix and suffix.')
      : undefined;
};
