import * as React from 'react';
import * as FormControl from 'react-bootstrap/lib/FormControl';

import { translate } from '@waldur/i18n';

export const SelectControl = ({ input, options }) => (
  <FormControl componentClass="select" {...input}>
    <option value="" disabled>
      {translate('Select an option...')}
    </option>
    {(options || []).map((option, index) => (
      <option value={option} key={index}>
        {option}
      </option>
    ))}
  </FormControl>
);
