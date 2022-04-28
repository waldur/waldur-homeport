import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';

interface FieldErrorProps {
  error?: string;
}

export const FieldError: FunctionComponent<FieldErrorProps> = (props) =>
  props.error ? (
    <Form.Text className="text-danger" as="div">
      {Array.isArray(props.error)
        ? props.error.map((e, i) => <div key={i}>{e}</div>)
        : props.error}
    </Form.Text>
  ) : null;
