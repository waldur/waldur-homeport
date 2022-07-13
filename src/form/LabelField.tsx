import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';

interface LabelFieldProps {
  label: string;
}

export const LabelField: FunctionComponent<LabelFieldProps> = (props) => (
  <Form.Group>
    <div className="offset-sm-3 col-sm-3 col-md-8">
      <p>
        <strong>{props.label}</strong>
      </p>
    </div>
  </Form.Group>
);
