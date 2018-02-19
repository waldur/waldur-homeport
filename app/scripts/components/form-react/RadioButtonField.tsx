import * as React from 'react';

import { FormField } from '@waldur/form-react/types';
import { translate } from '@waldur/i18n';

interface RadioButtonFieldProps extends FormField {
  choices: RadioButtonChoice[];
}

export class RadioButtonChoice {
  constructor(public value: any, public label: string) {
  }
}

export const RadioButtonField = (props: RadioButtonFieldProps) => {
  const {input, label, validate, ...rest} = props;
  return (
    <>
      {props.choices.map((choice, index) => (
        <div className="row" key={index}>
          <label>
            <input
              {...props.input}
              type="radio"
              value={choice.value}
              checked={props.input.value === choice.value}
              {...rest}
            />
            {' ' + translate(choice.label)}
          </label>
        </div>
      ))}
    </>
  );
};
