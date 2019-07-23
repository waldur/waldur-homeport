import * as React from 'react';

import { FormField } from './types';

interface NumberFieldProps extends FormField {
  step?: number | string;
  min?: number | string;
  max?: number | string;
  unit?: string;
  placeholder?: string;
}

export const NumberField = (props: NumberFieldProps) => {
  const { input, label, validate, parse, format, ...rest } = props;
  const control = (
    <input
      {...props.input}
      type="number"
      className="form-control"
      {...rest}
    />
  );
  if (props.unit) {
    return (
      <div className="input-group" style={{maxWidth: '15em'}}>
        {control}
        <span className="input-group-addon">{props.unit}</span>
      </div>
    );
  } else {
    return control;
  }
};
