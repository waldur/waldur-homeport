import { FunctionComponent } from 'react';
import { Form, InputGroup } from 'react-bootstrap';

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
    <Form.Control
      {...props.input}
      className="form-control-solid"
      type="number"
      {...rest}
    />
  );
  if (props.unit) {
    return (
      <InputGroup style={{ minWidth: '8em', maxWidth: '15em', zIndex: 0 }}>
        {control}
        <InputGroup.Text>{props.unit}</InputGroup.Text>
      </InputGroup>
    );
  } else {
    return control;
  }
};
