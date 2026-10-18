import { FunctionComponent } from 'react';

import { NativeSelect } from 'waldur-ui';

import { translate } from '@/i18n';

export const SelectControl: FunctionComponent<{
  id?;
  input;
  options;
  getLabel;
  getValue;
}> = ({ id, input, options, getLabel, getValue }) => (
  <NativeSelect
    id={id}
    value={getValue(input.value)}
    onChange={(e: any) =>
      input.onChange(
        options.find((option) => getValue(option) === e.target.value),
      )
    }
  >
    <option>{translate('Select an option...')}</option>
    {(options || []).map((option, index) => (
      <option value={getValue(option)} key={index}>
        {getLabel(option)}
      </option>
    ))}
  </NativeSelect>
);
