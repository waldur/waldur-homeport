import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';

export const OpenStackSubnetField: FunctionComponent<any> = (props) => (
  <Form.Control {...props.input} />
);
