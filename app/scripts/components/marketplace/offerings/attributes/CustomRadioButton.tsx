import * as React from 'react';

import { FormField } from '@waldur/form-react/types';
import { Choice } from '@waldur/marketplace/offerings/types';

import './CustomRadioButton.scss';

interface CustomRadioButtonProps extends FormField {
  choices: Choice[];
}

export const CustomRadioButton = (props: CustomRadioButtonProps) => (
  <div className="custom-radio-button">
    {props.choices.map((choice, index) => (
      <label key={index}>
        <input
          {...props.input}
          type="radio"
          value={choice.value}
          checked={props.input.value === choice.value}
          {...props}
        />
        <div className="custom-checkmark"/>
        <span className="radio-label">{choice.label}</span>
      </label>
    ))}
  </div>
);
