import { FC, useMemo } from 'react';

import { Select } from '@waldur/form/themed-select';
import { FormField } from '@waldur/form/types';

import { getGenderChoices } from '../aai-constants';

interface GenderSelectFieldProps extends FormField {
  isClearable?: boolean;
  isDisabled?: boolean;
}

export const GenderSelectField: FC<GenderSelectFieldProps> = ({
  input,
  isClearable = true,
  isDisabled = false,
}) => {
  const options = useMemo(() => getGenderChoices(), []);

  return (
    <Select
      value={options.find((option) => option.value === input.value) || null}
      onChange={(option: { value: number; label: string } | null) => {
        input.onChange(option?.value ?? null);
        input.onBlur(option?.value ?? null);
      }}
      onBlur={() => input.onBlur(input.value)}
      options={options}
      getOptionLabel={(option) => option.label}
      getOptionValue={(option) => String(option.value)}
      isClearable={isClearable}
      isDisabled={isDisabled}
      className="metronic-select-container"
      classNamePrefix="metronic-select"
    />
  );
};
