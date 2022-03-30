import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';

interface LabelFieldProps {
  label: string;
}

export const LabelField: FunctionComponent<LabelFieldProps> = (props) => (
  <Form.Group>
    <div className="col-sm-offset-3 col-sm-3 col-md-8">
      <Form.Control plaintext>
        <strong>{props.label}</strong>
      </Form.Control>
    </div>
  </Form.Group>
);
