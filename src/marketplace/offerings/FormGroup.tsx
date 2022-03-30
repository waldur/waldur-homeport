import React, { useContext } from 'react';
import { Form } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';
import { FormFieldsContext } from '@waldur/form/context';

export interface FormGroupProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
  labelClassName?: string;
  valueClassName?: string;
  classNameWithoutLabel?: string;
}

export const FormGroup: React.FC<FormGroupProps> = (props) => {
  const { labelClassName, valueClassName, classNameWithoutLabel } =
    useContext(FormFieldsContext);

  return (
    <Form.Group>
      {props.label ? (
        <>
          <Form.Label className={labelClassName}>
            {props.description && (
              <Tip id="form-field-tooltip" label={props.description}>
                <i className="fa fa-question-circle" />{' '}
              </Tip>
            )}
            {props.label}
            {props.required && <span className="text-danger"> *</span>}
          </Form.Label>
          <div className={valueClassName ?? props.valueClassName}>
            {props.children}
          </div>
        </>
      ) : (
        <div className={classNameWithoutLabel ?? props.classNameWithoutLabel}>
          {props.children}
        </div>
      )}
    </Form.Group>
  );
};

FormGroup.defaultProps = {
  labelClassName: 'col-sm-4',
  valueClassName: 'col-sm-8',
  classNameWithoutLabel: 'col-sm-offset-4 col-sm-8',
};
