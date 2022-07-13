import React, { useContext } from 'react';
import { Form, Row } from 'react-bootstrap';

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
  const ctx = useContext(FormFieldsContext);
  const labelClassName = ctx.labelClassName || props.labelClassName;
  const valueClassName = ctx.valueClassName || props.valueClassName;
  const classNameWithoutLabel =
    ctx.classNameWithoutLabel || props.classNameWithoutLabel;

  return (
    <Form.Group as={Row} className="mb-2">
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
          <div className={valueClassName}>{props.children}</div>
        </>
      ) : (
        <div className={classNameWithoutLabel}>{props.children}</div>
      )}
    </Form.Group>
  );
};

FormGroup.defaultProps = {
  labelClassName: 'col-sm-4',
  valueClassName: 'col-sm-8',
  classNameWithoutLabel: 'offset-sm-4 col-sm-8',
};
