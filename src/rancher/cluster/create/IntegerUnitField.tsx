import { FunctionComponent } from 'react';
import { Form, InputGroup } from 'react-bootstrap';

import { FieldError } from '@waldur/form';

export const IntegerUnitField: FunctionComponent<any> = (props) => (
  <>
    <InputGroup style={{ maxWidth: 200 }}>
      <Form.Control {...props.input} type="number" min="0" />
      <InputGroup.Text>{props.units}</InputGroup.Text>
    </InputGroup>
    {props.meta.touched && <FieldError error={props.meta.error} />}
  </>
);
