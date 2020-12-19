import { FunctionComponent } from 'react';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';

export const SelectMultiCheckboxGroup: FunctionComponent<any> = (props) => (
  <>
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
  </>
);
