import { Props as SelectProps, OptionTypeBase } from 'react-select';

import { Select } from './themed-select';

export function SelectControl<
  OptionType extends OptionTypeBase = { label: string; value: string },
>(props: SelectProps<OptionType>) {
  return (
    <Select
      styles={{ menu: (base) => ({ ...base, zIndex: 9999 }) }}
      {...props}
    />
  );
}
