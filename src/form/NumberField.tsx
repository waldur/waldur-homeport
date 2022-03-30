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
  const control = <Form.Control {...props.input} type="number" {...rest} />;
  if (props.unit) {
    return (
      <InputGroup style={{ maxWidth: '15em', zIndex: 0 }}>
        <div style={{ minWidth: '8em' }}>{control}</div>
        <InputGroup.Text>{props.unit}</InputGroup.Text>
      </InputGroup>
    );
  } else {
    return control;
  }
};
