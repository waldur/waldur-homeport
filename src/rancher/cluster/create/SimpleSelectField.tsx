import * as React from 'react';

import { FieldError } from '@waldur/form';
import { SelectControl } from '@waldur/form/SelectControl';

export const SimpleSelectField = (props) => (
  <>
    <SelectControl
      value={props.options.filter(({ value }) => value === props.input.value)}
      onChange={({ value }) => props.input.onChange(value)}
      options={props.options}
      isClearable={false}
    />
    {props.meta.touched && <FieldError error={props.meta.error} />}
  </>
);
