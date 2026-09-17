import { OfferingOptions } from 'waldur-js-client';

import { translate } from '@/i18n';
import { isVisibleIfFieldType } from '@/marketplace/common/optionVisibility';

export interface OptionFormContext {
  /** The offering's `options` or `resource_options` being edited. */
  options?: OfferingOptions;
  /** Key of the edited option; omitted when a new option is being added. */
  optionKey?: string;
}

/**
 * Options that a visibility rule of `optionKey` may refer to: those that come
 * earlier in `order` and whose type is boolean or a select. A new option is
 * appended to the end, so every existing option comes before it.
 */
export const getVisibleIfCandidates = (
  options: OfferingOptions | undefined,
  optionKey?: string,
): string[] => {
  const order = options?.order || [];
  const position = optionKey === undefined ? -1 : order.indexOf(optionKey);
  const earlier = position === -1 ? order : order.slice(0, position);
  return earlier.filter(
    (key) =>
      key !== optionKey && isVisibleIfFieldType(options?.options?.[key]?.type),
  );
};

/** Options whose "Show only when" rule refers to `optionKey`. */
export const getDependentOptions = (
  options: OfferingOptions | undefined,
  optionKey: string,
) =>
  Object.entries(options?.options || {})
    .filter(([, option]) => option?.visible_if?.field === optionKey)
    .map(([key, option]) => ({ key, option }));

export const formatDependentOptionsError = (
  dependents: ReturnType<typeof getDependentOptions>,
) =>
  translate('Remove the "Show only when" rule from: {options} first.', {
    options: dependents
      .map(({ key, option }) => option.label || key)
      .join(', '),
  });

const parseChoices = (choices) =>
  typeof choices === 'string'
    ? choices
        .split(',')
        .map((choice) => choice.trim())
        .filter((choice) => choice.length > 0)
    : choices || [];

/**
 * Dependent options whose rules would no longer be valid if the edited option
 * got the type and choices in `values`.
 */
const getBrokenDependents = (values, context: OptionFormContext) => {
  if (context.optionKey === undefined) {
    return [];
  }
  const type = values.type?.value;
  const choices = parseChoices(values.choices);
  return getDependentOptions(context.options, context.optionKey).filter(
    ({ option }) => {
      const ruleValues = option.visible_if.values || [];
      if (type === 'boolean') {
        return !ruleValues.every((value) => typeof value === 'boolean');
      }
      if (isVisibleIfFieldType(type)) {
        return !ruleValues.every(
          (value) => typeof value === 'string' && choices.includes(value),
        );
      }
      return true;
    },
  );
};

/** Mirrors `OfferingOptionsSerializer._validate_visible_if` in mastermind. */
const validateVisibleIf = (
  rule: { field?: string; values?: Array<boolean | string> } | undefined,
  context: OptionFormContext,
) => {
  if (!rule) {
    return undefined;
  }
  if (!rule.field) {
    return { field: translate('Select the option this one depends on.') };
  }
  if (
    !getVisibleIfCandidates(context.options, context.optionKey).includes(
      rule.field,
    )
  ) {
    return {
      field: translate(
        'The option must be an earlier boolean or select option.',
      ),
    };
  }
  const values = rule.values || [];
  if (values.length === 0) {
    return { values: translate('Select at least one value.') };
  }
  const parent = context.options.options[rule.field];
  const valid =
    parent.type === 'boolean'
      ? values.every((value) => typeof value === 'boolean')
      : values.every(
          (value) =>
            typeof value === 'string' && (parent.choices || []).includes(value),
        );
  if (!valid) {
    return {
      values: translate('Values must be valid for the selected option.'),
    };
  }
  return undefined;
};

export const validateOptionForm = (values, context: OptionFormContext = {}) => {
  const errors: any = {};
  if (values.type?.value === 'storage_folder_manager') {
    const soft = values.storage_folder_config?.inode_soft_multiplier;
    const hard = values.storage_folder_config?.inode_hard_multiplier;
    if (soft && hard && parseFloat(hard) < parseFloat(soft)) {
      if (!errors.storage_folder_config) {
        errors.storage_folder_config = {};
      }
      errors.storage_folder_config.inode_hard_multiplier = translate(
        'Hard inode multiplier cannot be less than soft inode multiplier',
      );
    }
  }
  const brokenDependents = getBrokenDependents(values, context);
  if (brokenDependents.length > 0) {
    // Not a registered field: OptionForm shows it above the submit button.
    errors.dependents = formatDependentOptionsError(brokenDependents);
  }
  const visibleIfErrors = validateVisibleIf(values.visible_if, context);
  if (visibleIfErrors) {
    errors.visible_if = visibleIfErrors;
  }
  return errors;
};
