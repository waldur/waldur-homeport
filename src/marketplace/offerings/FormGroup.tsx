import { Question } from '@phosphor-icons/react';
import { ReactNode, FC, PropsWithChildren } from 'react';
import { Form } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';

interface FormGroupProps {
  label?: ReactNode;
  description?: ReactNode;
  required?: boolean;
}

export const FormGroup: FC<PropsWithChildren<FormGroupProps>> = (props) => (
  <Form.Group className="mb-7">
    {props.label ? (
      <>
        <Form.Label className="fs-6 fw-semibold form-label mt-3">
          {props.description && (
            <Tip id="form-field-tooltip" label={props.description}>
              <Question />{' '}
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
