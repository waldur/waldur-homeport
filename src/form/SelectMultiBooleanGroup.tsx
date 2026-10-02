import { FunctionComponent } from 'react';

import { AwesomeCheckbox } from '@/core/AwesomeCheckbox';

export const SelectMultiBooleanGroup: FunctionComponent<any> = (props) => (
  // A checkbox list is one group, so its items sit close together; switches
  // are separate settings and keep their room.
  <div
    className={`d-flex flex-column ${props.checkboxes ? 'gap-8px' : 'gap-6'}`}
  >
    {props.options.map((value, index) => (
      <AwesomeCheckbox
        // Checkboxes for picking several items to submit; switches by default.
        type={props.checkboxes ? 'checkbox' : undefined}
        label={value}
        key={index}
        disabled={props.disabled}
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
