import { Props as SelectProps } from 'react-select';

import { Select } from './themed-select';

export function SelectControl<OptionType = { label: string; value: string }>(
  props: SelectProps<OptionType>,
) {
  return (
    <Select
      styles={{ menu: (base) => ({ ...base, zIndex: 9999 }) }}
      {...props}
    />
  );
}
