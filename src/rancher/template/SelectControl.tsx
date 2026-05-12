import { FunctionComponent } from 'react';
import { FormControl } from 'react-bootstrap';

import { translate } from '@/i18n';

export const SelectControl: FunctionComponent<{
  id?;
  input;
  options;
  getLabel;
  getValue;
}> = ({ id, input, options, getLabel, getValue }) => (
  <FormControl
    id={id}
    as="select"
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
  </FormControl>
);
