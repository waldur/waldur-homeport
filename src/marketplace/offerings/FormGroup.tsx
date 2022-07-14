import React from 'react';
import { Form } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';

export interface FormGroupProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
  labelClassName?: string;
  valueClassName?: string;
  classNameWithoutLabel?: string;
}

export const FormGroup: React.FC<FormGroupProps> = (props) => {
  return (
    <Form.Group className="mb-7">
      {props.label ? (
        <>
          <Form.Label className="fs-6 fw-semibold form-label mt-3">
            {props.description && (
              <Tip id="form-field-tooltip" label={props.description}>
                <i className="fa fa-question-circle" />{' '}
              </Tip>
            )}
            {props.label}
            {props.required && <span className="text-danger"> *</span>}
          </Form.Label>
          <div>{props.children}</div>
        </>
      ) : (
        <div>{props.children}</div>
      )}
    </Form.Group>
  );
};

FormGroup.defaultProps = {
  labelClassName: 'col-sm-4',
  valueClassName: 'col-sm-8',
  classNameWithoutLabel: 'offset-sm-4 col-sm-8',
};
