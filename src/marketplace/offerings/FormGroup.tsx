import { QuestionIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { ReactNode, FC, PropsWithChildren } from 'react';
import { Form } from 'react-bootstrap';
import { FieldMetaState } from 'react-final-form';

import { Tip } from '@waldur/core/Tooltip';
import { FieldError } from '@waldur/form';

interface FormGroupProps {
  label?: ReactNode;
  help?: ReactNode;
  description?: ReactNode;
  meta?: FieldMetaState<any>;
  required?: boolean;
  controlId?: string;
  quickAction?: ReactNode;
  spaceless?: boolean;
  className?: string;
  id?: string;
}

export const FormGroup: FC<PropsWithChildren<FormGroupProps>> = (props) => (
  <Form.Group
    className={classNames(
      props.className,
      props.spaceless ? undefined : 'mb-7',
    )}
    controlId={props.controlId}
    id={props.id}
  >
    {Boolean(props.label || props.quickAction) && (
      <div className="d-flex align-items-end">
        {!!props.label && (
          <Form.Label>
            {props.help && (
              <Tip id="form-field-tooltip" label={props.help}>
                <QuestionIcon />{' '}
              </Tip>
            )}
            {props.label}
            {props.required && <span className="text-danger"> *</span>}
          </Form.Label>
        )}
        {props.quickAction && (
          <div className="ms-auto">{props.quickAction}</div>
        )}
      </div>
    )}
    <div>{props.children}</div>
    {props.description && (
      <Form.Text className="text-muted">{props.description}</Form.Text>
    )}
    {props.meta?.touched && props.meta?.error && (
      <FieldError error={props.meta.error} />
    )}
  </Form.Group>
);
