import { FunctionComponent } from 'react';

import { FormField } from './types';

interface NumberFieldProps extends FormField {
  step?: number | string;
  min?: number | string;
  max?: number | string;
  unit?: string;
  placeholder?: string;
}

export const NumberField: FunctionComponent<NumberFieldProps> = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { input, label, validate, parse, format, ...rest } = props;
  const control = (
    <input {...props.input} type="number" className="form-control" {...rest} />
  );
  if (props.unit) {
    return (
      <div className="input-group" style={{ maxWidth: '15em', zIndex: 0 }}>
        <div style={{ minWidth: '8em' }}>{control}</div>
        <span className="input-group-addon">{props.unit}</span>
      </div>
    );
  } else {
    return control;
  }
};
