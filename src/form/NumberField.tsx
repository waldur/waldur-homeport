import { CSSProperties, FunctionComponent } from 'react';
import { Form, InputGroup } from 'react-bootstrap';

import { FormField } from './types';

interface NumberFieldProps extends FormField {
  style?: CSSProperties;
  step?: number | string;
  min?: number | string;
  max?: number | string;
  unit?: string;
  placeholder?: string;
}

export const NumberField: FunctionComponent<NumberFieldProps> = ({
  input,
  unit,
  placeholder = '  ',
  ...rest
}) => {
  const control = (
    <Form.Control
      {...input}
      className="form-control-solid"
      type="number"
      placeholder={placeholder}
      {...rest}
    />
  );
  if (unit) {
    return (
      <>
        {control}
        <InputGroup.Text className="border-0 unit">{unit}</InputGroup.Text>
      </>
    );
  } else {
    return control;
  }
};
