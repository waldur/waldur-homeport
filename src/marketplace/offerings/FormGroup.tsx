import { QuestionIcon } from '@phosphor-icons/react';
import { ReactNode, FC, PropsWithChildren } from 'react';
import { Form } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';

interface FormGroupProps {
  label?: ReactNode;
  description?: ReactNode;
  required?: boolean;
  controlId?: string;
  quickAction?: ReactNode;
  spaceless?: boolean;
}

export const FormGroup: FC<PropsWithChildren<FormGroupProps>> = (props) => (
  <Form.Group
    className={props.spaceless ? undefined : 'mb-7'}
    controlId={props.controlId}
  >
    {props.label ? (
      <>
        <div className="d-flex align-items-end">
          <Form.Label className="fs-6 fw-semibold form-label mt-3">
            {props.description && (
              <Tip id="form-field-tooltip" label={props.description}>
                <QuestionIcon />{' '}
              </Tip>
            )}
            {props.label}
            {props.required && <span className="text-danger"> *</span>}
          </Form.Label>
          {props.quickAction && (
            <div className="ms-auto">{props.quickAction}</div>
          )}
        </div>
        <div>{props.children}</div>
      </>
    ) : (
      <>
        {props.quickAction && (
          <div className="d-flex align-items-end">
            <div className="ms-auto">{props.quickAction}</div>
          </div>
        )}
        <div>{props.children}</div>
      </>
    )}
  </Form.Group>
);
