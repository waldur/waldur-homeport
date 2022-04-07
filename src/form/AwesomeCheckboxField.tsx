import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';

import { FormField } from './types';

interface AwesomeCheckboxFieldProps extends FormField {
  className?: string;
  checked?: boolean;
}

export const AwesomeCheckboxField: FunctionComponent<AwesomeCheckboxFieldProps> =
  ({ input, label }) => (
    <label className="form-check form-switch form-check-custom form-check-solid">
      <Form.Check
        checked={input.value}
        onChange={(e: React.ChangeEvent<any>) =>
          input.onChange(e.target.checked)
        }
      />
      <span className="form-check-label fw-bold">{label}</span>
    </label>
  );
