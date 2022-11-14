import classNames from 'classnames';
import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';

import { FormField } from './types';

interface AwesomeCheckboxFieldProps extends FormField {
  className?: string;
  checked?: boolean;
}

export const AwesomeCheckboxField: FunctionComponent<AwesomeCheckboxFieldProps> =
  ({ input, label, className }) => (
    <div
      className={classNames(
        'form-check form-switch form-check-custom form-check-solid',
        className,
      )}
    >
      <Form.Check
        checked={input.value}
        onChange={(e: React.ChangeEvent<any>) =>
          input.onChange(e.target.checked)
        }
      />
      <span className="form-check-label fw-bold">{label}</span>
    </div>
  );
