import * as React from 'react';

import { required } from '@waldur/core/validators';
import { SelectField } from '@waldur/form';

export const CreateSelectField = (label, name, options) => (
  <SelectField
    label={label}
    name={name}
    options={options}
    required={true}
    getOptionValue={(option) => option.url}
    getOptionLabel={(option) => option.name}
    isClearable={false}
    validate={required}
    simpleValue={true}
  />
);
