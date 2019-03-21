import * as React from 'react';

import { Tooltip } from '@waldur/core/Tooltip';

interface FormGroupProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
  classNameWithoutLabel?: string;
}

export const FormGroup: React.SFC<FormGroupProps> = props => (
  <div className={props.className}>
    {props.label ? (
      <>
        <label className={props.labelClassName}>
          {props.description && (
            <Tooltip id="form-field-tooltip" label={props.description}>
              <i className="fa fa-question-circle"/>{' '}
            </Tooltip>
          )}
          {props.label}
          {props.required && <span className="text-danger"> *</span>}
        </label>
        <div className={props.valueClassName}>
          {props.children}
        </div>
      </>
    ) : (
      <div className={props.classNameWithoutLabel}>
        {props.children}
      </div>
    )}
  </div>
);

FormGroup.defaultProps = {
  className: 'form-group',
  labelClassName: 'control-label col-sm-4',
  valueClassName: 'col-sm-8',
  classNameWithoutLabel: 'col-sm-offset-4 col-sm-8',
};
