import { FunctionComponent } from 'react';
import { FormText } from 'waldur-ui';

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
    // A caution is not an interruption: announced politely, when it appears.
    <FormText variant="warning" as="div" role="status">
      <FieldErrorMessage error={error} center={center} />
    </FormText>
  ) : null;
};
