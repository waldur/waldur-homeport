import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';

import { FieldErrorMessage } from './FieldError';

interface FieldWarningProps {
  error?: string | object | Array<any>;
  center?: boolean;
}

/**
 * Non-blocking counterpart of FieldError: same markup and message rendering,
 * warning colour. Used where the form stays submittable.
 */
export const FieldWarning: FunctionComponent<FieldWarningProps> = ({
  error,
  center,
}) => {
  return error ? (
    <Form.Text className="text-warning" as="div">
      <FieldErrorMessage error={error} center={center} />
    </Form.Text>
  ) : null;
};
