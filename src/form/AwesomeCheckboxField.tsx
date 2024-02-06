import classNames from 'classnames';
import { FunctionComponent, ReactNode } from 'react';
import { Form } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';

import { FormField } from './types';

interface AwesomeCheckboxFieldProps extends FormField {
  className?: string;
  checked?: boolean;
  tooltip?: ReactNode;
}

export const AwesomeCheckboxField: FunctionComponent<AwesomeCheckboxFieldProps> =
  ({ input, label, className, tooltip }) => (
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
      <label className="form-check-label">
        {tooltip && (
          <Tip id="form-field-tooltip" label={tooltip}>
            <i className="fa fa-question-circle" />{' '}
          </Tip>
        )}
        <span className="fw-bold">{label}</span>
      </label>
    </div>
  );
