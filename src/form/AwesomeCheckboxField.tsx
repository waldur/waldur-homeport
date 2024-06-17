import { Question } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FunctionComponent, ReactNode } from 'react';
import { Form } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';

import { FormField } from './types';

interface AwesomeCheckboxFieldProps extends FormField {
  className?: string;
  checked?: boolean;
  tooltip?: ReactNode;
  help_text?: ReactNode;
}

export const AwesomeCheckboxField: FunctionComponent<
  AwesomeCheckboxFieldProps
> = ({ input, label, className, tooltip, help_text }) => (
  <div
    className={classNames(
      'form-check form-switch form-check-custom form-check-solid',
      className,
    )}
  >
    <Form.Check
      checked={input.value}
      onChange={(e: React.ChangeEvent<any>) => input.onChange(e.target.checked)}
    />
    <label className="form-check-label">
      {tooltip && (
        <Tip id="form-field-tooltip" label={tooltip}>
          <Question />{' '}
        </Tip>
      )}
      <span className="fw-bold">{label}</span>
      {help_text && <p className="text-muted">{help_text}</p>}
    </label>
  </div>
);
