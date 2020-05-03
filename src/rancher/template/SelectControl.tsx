import * as React from 'react';
import * as FormControl from 'react-bootstrap/lib/FormControl';

import { translate } from '@waldur/i18n';

export const SelectControl = ({ input, options, getLabel, getValue }) => (
  <FormControl
    componentClass="select"
    value={getValue(input.value)}
    onChange={(e: any) =>
      input.onChange(
        options.find(option => getValue(option) === e.target.value),
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
