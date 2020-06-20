import * as React from 'react';

import { required } from '@waldur/core/validators';
import { SelectField } from '@waldur/form';

export const CreateSelectField = (label, name, options) => (
  <SelectField
    label={label}
    name={name}
    options={options}
    required={true}
    labelKey="name"
    valueKey="url"
    clearable={false}
    validate={required}
    simpleValue={true}
  />
);
