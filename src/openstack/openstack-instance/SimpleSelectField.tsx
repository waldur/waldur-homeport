import { FunctionComponent } from 'react';

import { FieldError } from '@waldur/form';
import { Select } from '@waldur/form/themed-select';

export const SimpleSelectField: FunctionComponent<any> = (props) => (
  <>
    <Select
      value={props.input.value}
      onChange={props.input.onChange}
      options={props.options}
    />
    {props.meta.touched && <FieldError error={props.meta.error} />}
  </>
);
