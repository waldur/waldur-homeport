import * as React from 'react';
import Select from 'react-select';

import { FieldError } from '@waldur/form';

export const SimpleSelectField = (props) => (
  <>
    <Select
      value={props.options.filter(({ value }) => value === props.input.value)}
      onChange={({ value }) => props.input.onChange(value)}
      options={props.options}
      isClearable={false}
    />
    {props.meta.touched && <FieldError error={props.meta.error} />}
  </>
);
