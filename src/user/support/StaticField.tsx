import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';

interface StaticFieldProps {
  label: string;
  value: string;
}

export const StaticField: FunctionComponent<StaticFieldProps> = (props) => (
  <Form.Group>
    <Form.Label className="col-sm-3 col-md-4 col-lg-3">
      {props.label}
    </Form.Label>
    <div className="col-sm-9 col-md-8">
      <Form.Control plaintext>{props.value}</Form.Control>
    </div>
  </Form.Group>
);
