import { FunctionComponent } from 'react';

import { Checkbox, Switch } from 'waldur-ui';

export const SelectMultiBooleanGroup: FunctionComponent<any> = (props) => {
  // Checkboxes for picking several items to submit; switches by default.
  const Control = props.checkboxes ? Checkbox : Switch;
  return (
    // A checkbox list is one group, so its items sit close together; switches
    // are separate settings and keep their room.
    <div
      className={`d-flex flex-column ${props.checkboxes ? 'gap-8px' : 'gap-6'}`}
    >
      {props.options.map((value, index) => (
        <Control
          label={value}
          key={index}
          disabled={props.disabled}
          checked={
            props.input.value.length ? props.input.value.includes(value) : false
          }
          onCheckedChange={(event: boolean) => {
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
};
