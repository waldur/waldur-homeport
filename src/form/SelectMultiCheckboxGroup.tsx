import { FunctionComponent } from 'react';

import { AwesomeCheckbox } from '@/core/AwesomeCheckbox';

export const SelectMultiCheckboxGroup: FunctionComponent<any> = (props) => (
  <div className="d-flex flex-column gap-6">
    {props.options.map((value, index) => (
      <AwesomeCheckbox
        label={value}
        key={index}
        value={
          props.input.value.length ? props.input.value.includes(value) : false
        }
        onChange={(event: boolean) => {
          if (event) {
            props.input.onChange([...props.input.value, value]);
          } else {
            props.input.onChange(
              props.input.value.filter((item) => item !== value),
            );
          }
        }}
      />
    ))}
  </div>
);
