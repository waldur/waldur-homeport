import React, { useContext } from 'react';

import { Tooltip } from '@waldur/core/Tooltip';
import { FormFieldsContext } from '@waldur/form/context';

export interface FormGroupProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
  classNameWithoutLabel?: string;
}

export const FormGroup: React.FC<FormGroupProps> = (props) => {
  const { labelClassName, valueClassName, classNameWithoutLabel } =
    useContext(FormFieldsContext);

  return (
    <div className={props.className}>
      {props.label ? (
        <>
          <label className={labelClassName ?? props.labelClassName}>
            {props.description && (
              <Tooltip id="form-field-tooltip" label={props.description}>
                <i className="fa fa-question-circle" />{' '}
              </Tooltip>
            )}
            {props.label}
            {props.required && <span className="text-danger"> *</span>}
          </label>
          <div className={valueClassName ?? props.valueClassName}>
            {props.children}
          </div>
        </>
      ) : (
        <div className={classNameWithoutLabel ?? props.classNameWithoutLabel}>
          {props.children}
        </div>
      )}
    </div>
  );
};

FormGroup.defaultProps = {
  className: 'form-group',
  labelClassName: 'control-label col-sm-4',
  valueClassName: 'col-sm-8',
  classNameWithoutLabel: 'col-sm-offset-4 col-sm-8',
};
