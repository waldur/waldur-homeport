import { FunctionComponent } from 'react';

import { FieldError } from '@/form';
import { Select } from '@/form/themed-select';

export const SimpleSelectField: FunctionComponent<any> = (props) => (
  <>
    <Select
      value={props.options.find(({ value }) => value === props.input.value)}
      onChange={({ value }) => props.input.onChange(value)}
      options={props.options}
      isClearable={false}
      instanceId={props.input.name}
    />

    {props.meta.touched && <FieldError error={props.meta.error} />}
  </>
);
