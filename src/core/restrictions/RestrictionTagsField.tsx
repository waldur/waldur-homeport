import { FC, useMemo } from 'react';

import { CreatableSelect } from 'waldur-ui';

import { FormField } from '@/form/types';
import { translate } from '@/i18n';

interface RestrictionTagOption {
  value: string;
  label: string;
}

interface RestrictionTagsFieldProps extends FormField {
  /** Suggestions shown in the dropdown. Values outside the list stay typeable:
   * every one of these restrictions is matched against whatever the identity
   * provider sends, and no vocabulary covers every deployment. */
  options?: RestrictionTagOption[];
  placeholder?: string;
  isDisabled?: boolean;
}

export const RestrictionTagsField: FC<RestrictionTagsFieldProps> = ({
  input,
  options = [],
  placeholder,
  isDisabled,
}) => {
  const values: string[] = Array.isArray(input.value) ? input.value : [];

  // A stored value the vocabulary does not know still has to show as a tag --
  // react-select renders a selection only if it can find it among the options.
  const allOptions = useMemo(() => {
    const known = new Set(options.map((option) => option.value));
    return [
      ...options,
      ...values
        .filter((value) => !known.has(value))
        .map((value) => ({ value, label: value })),
    ];
  }, [options, values]);

  // Kept in the stored order rather than the option order, so saving an
  // untouched field cannot reshuffle what is already on the call.
  const byValue = new Map(allOptions.map((option) => [option.value, option]));
  const selected = values
    .map((value) => byValue.get(value))
    .filter((option): option is RestrictionTagOption => Boolean(option));

  return (
    <CreatableSelect
      inputId={input.name}
      isMulti
      isClearable
      isDisabled={isDisabled}
      options={allOptions}
      value={selected}
      placeholder={placeholder ?? translate('Select or type a value')}
      noOptionsMessage={() => translate('Type a value to add it')}
      formatCreateLabel={(value: string) => translate('Add {value}', { value })}
      onChange={(next: readonly RestrictionTagOption[] | null) =>
        input.onChange(next ? next.map((option) => option.value) : [])
      }
      onBlur={() => input.onBlur()}
    />
  );
};
