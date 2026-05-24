import { FC, useMemo } from 'react';

import { Select } from '@/form/select';
import { FormField } from '@/form/types';

import { getPersonalTitleOptions } from '../aai-constants';

interface PersonalTitleSelectFieldProps extends FormField {
  isClearable?: boolean;
  isDisabled?: boolean;
}

export const PersonalTitleSelectField: FC<PersonalTitleSelectFieldProps> = ({
  input,
  isClearable = true,
  isDisabled = false,
}) => {
  const options = useMemo(() => getPersonalTitleOptions(), []);

  return (
    <Select
      value={options.find((option) => option.value === input.value) || null}
      onChange={(option: { value: string; label: string } | null) => {
        input.onChange(option?.value ?? null);
        input.onBlur();
      }}
      onBlur={() => input.onBlur()}
      options={options}
      getOptionLabel={(option) => option.label}
      getOptionValue={(option) => option.value}
      isClearable={isClearable}
      isDisabled={isDisabled}
    />
  );
};
