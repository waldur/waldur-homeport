import { OptionField, OptionVisibleIf } from 'waldur-js-client';

/**
 * Offering options can carry a `visible_if` rule: the option is shown only
 * when an earlier option has one of the listed values. A hidden option counts
 * as having no value, so hiding cascades down a chain of rules. This mirrors
 * `get_hidden_options` in waldur-mastermind (common/serializers.py).
 */

type OptionsMap = Record<string, Partial<OptionField> | null | undefined>;

/** Option types whose value can decide whether another option is shown. */
const VISIBLE_IF_FIELD_TYPES = [
  'boolean',
  'select_string',
  'select_string_multi',
] as const;

export const isVisibleIfFieldType = (type: string | undefined) =>
  (VISIBLE_IF_FIELD_TYPES as readonly string[]).includes(type);

const TRUE_VALUES = [true, 'true', 'True', 'TRUE', 1, '1', 'yes', 'on'];
const FALSE_VALUES = [false, 'false', 'False', 'FALSE', 0, '0', 'no', 'off'];

const toBoolean = (value: unknown): boolean | undefined => {
  if (TRUE_VALUES.includes(value as any)) return true;
  if (FALSE_VALUES.includes(value as any)) return false;
  return undefined;
};

// A select field may hold the raw choice or a `{ value }` option object.
const toChoice = (value: unknown) =>
  value && typeof value === 'object' && 'value' in (value as any)
    ? (value as any).value
    : value;

export const optionValueMatches = (
  option: Partial<OptionField> | null | undefined,
  value: unknown,
  values: OptionVisibleIf['values'],
): boolean => {
  if (!option) {
    return false;
  }
  if (option.type === 'boolean') {
    // An unticked checkbox has no value at all, so a missing value means
    // false; otherwise a "show when unchecked" rule would never match.
    const bool =
      value === undefined || value === null ? false : toBoolean(value);
    return bool !== undefined && values.includes(bool);
  }
  if (value === undefined || value === null) {
    return false;
  }
  switch (option.type) {
    case 'select_string': {
      const choice = toChoice(value);
      return typeof choice === 'string' && values.includes(choice);
    }
    case 'select_string_multi': {
      const selected = Array.isArray(value) ? value : [value];
      return selected.some((item) => {
        const choice = toChoice(item);
        return typeof choice === 'string' && values.includes(choice);
      });
    }
    default:
      return false;
  }
};

/** Keys of the options hidden by their `visible_if` rules. */
export const getHiddenOptionKeys = (
  options: OptionsMap | undefined,
  values: Record<string, unknown> | undefined | null,
): Set<string> => {
  const hidden = new Set<string>();
  if (!options) {
    return hidden;
  }
  const currentValues = values || {};
  const visibility: Record<string, boolean> = {};

  const isVisible = (key: string, path: Set<string>): boolean => {
    if (key in visibility) {
      return visibility[key];
    }
    const rule = options[key]?.visible_if;
    let result: boolean;
    if (!rule) {
      result = true;
    } else if (!(rule.field in options) || path.has(rule.field)) {
      // Unknown references and cycles are rejected when the offering is
      // saved; treat them as hidden rather than looping.
      result = false;
    } else {
      result =
        isVisible(rule.field, new Set([...path, key])) &&
        optionValueMatches(
          options[rule.field],
          currentValues[rule.field],
          rule.values || [],
        );
    }
    visibility[key] = result;
    return result;
  };

  Object.keys(options).forEach((key) => {
    if (!isVisible(key, new Set([key]))) {
      hidden.add(key);
    }
  });
  return hidden;
};

/** Returns `values` without the entries of hidden options. */
export const omitHiddenOptionValues = <T extends Record<string, any>>(
  options: OptionsMap | undefined,
  values: T,
  hidden: Set<string> = getHiddenOptionKeys(options, values),
): T => {
  if (!values || hidden.size === 0) {
    return values;
  }
  return Object.fromEntries(
    Object.entries(values).filter(([key]) => !hidden.has(key)),
  ) as T;
};
