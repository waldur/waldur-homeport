import { FC, useMemo } from 'react';
import { type GenderEnum } from 'waldur-js-client';

import { Select } from '@/form/themed-select';
import { FormField } from '@/form/types';

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
      onChange={(option: { value: GenderEnum; label: string } | null) => {
        input.onChange(option?.value ?? null);
        input.onBlur();
      }}
      onBlur={() => input.onBlur()}
      options={options}
      getOptionLabel={(option) => option.label}
      getOptionValue={(option) => String(option.value)}
      isClearable={isClearable}
      isDisabled={isDisabled}
    />
  );
};
