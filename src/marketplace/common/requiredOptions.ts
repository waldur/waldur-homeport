import { OptionField } from 'waldur-js-client';

import { getHiddenOptionKeys } from './optionVisibility';

/** An offering's `options`: the fields keyed by name, and their order. */
export interface OfferingOptionsLike {
  order?: string[];
  options?: Record<string, Partial<OptionField> | null | undefined>;
}

export interface MissingOption {
  key: string;
  label: string;
}

// Computed from other values, never typed in (NON_INPUT_FIELD_TYPES there).
const NO_INPUT_TYPES = ['component_sum'];

/**
 * Every option of the offering: those in `order` first, then any the order
 * leaves out. The backend checks every option, not only the ordered ones.
 */
export const getOptionKeys = (
  offeringOptions: OfferingOptionsLike | null | undefined,
): string[] => {
  const fields = offeringOptions?.options;
  if (!fields) {
    return [];
  }
  const ordered = (offeringOptions.order ?? []).filter((key) => key in fields);
  return [
    ...ordered,
    ...Object.keys(fields).filter((key) => !ordered.includes(key)),
  ];
};

/**
 * Whether an option has no answer: undefined, null, or a string that is empty
 * once trimmed. The one definition of an empty option value, shared with the
 * backend's presence check. An empty multiple choice is an answer there, and
 * here; callers that read it (or an unticked box) as no answer layer that on
 * top, and say so.
 */
export const isEmptyOptionValue = (value: unknown) =>
  value === undefined ||
  value === null ||
  (typeof value === 'string' && value.trim() === '');

/**
 * The options an order of this offering must carry that `attributes` lacks.
 *
 * Mirrors `validate_options` in waldur-mastermind (common/serializers.py): an
 * option is required unless it has a default, and options hidden by their
 * `visible_if` rules are skipped. Booleans are skipped as `OptionsForm` skips
 * them: an unticked switch has no value at all.
 */
export const missingRequiredOptions = (
  offeringOptions: OfferingOptionsLike | null | undefined,
  attributes: Record<string, unknown> | null | undefined,
): MissingOption[] => {
  const fields = offeringOptions?.options;
  if (!fields) {
    return [];
  }
  const values = attributes || {};
  const hidden = getHiddenOptionKeys(fields, values);
  return getOptionKeys(offeringOptions)
    .filter((key) => {
      const option = fields[key];
      return (
        option?.required &&
        !option.default &&
        option.type !== 'boolean' &&
        !NO_INPUT_TYPES.includes(option.type) &&
        !hidden.has(key) &&
        isEmptyOptionValue(values[key])
      );
    })
    .map((key) => ({ key, label: fields[key].label || key }));
};
