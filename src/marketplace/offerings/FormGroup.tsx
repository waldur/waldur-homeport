import { QuestionIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { uniqueId } from 'lodash-es';
import { ReactNode, FC, PropsWithChildren, useMemo } from 'react';
import { Form } from 'react-bootstrap';
import { FieldMetaState } from 'react-final-form';

import { Tip } from '@/core/Tooltip';
import { FieldError } from '@/form';

interface FormGroupProps {
  label?: ReactNode;
  help?: ReactNode;
  helpEnd?: boolean;
  description?: ReactNode;
  meta?: FieldMetaState<any>;
  required?: boolean;
  controlId?: string;
  quickAction?: ReactNode;
  spaceless?: boolean;
  space?: number;
  className?: string;
  id?: string;
}

const FormLabel = (props) => (
  <Form.Label className="me-auto">
    {props.help && !props.helpEnd && (
      <Tip id="form-field-tooltip" label={props.help}>
        <QuestionIcon weight="bold" data-testid="question-icon" />{' '}
      </Tip>
    )}
    {props.label}
    {props.required && <span className="text-danger"> *</span>}
  </Form.Label>
);

export const FormGroup: FC<PropsWithChildren<FormGroupProps>> = ({
  space = 7,
  ...props
}) => {
  const controlId = useMemo(
    () => props.controlId || uniqueId('form-group-'),
    [props.controlId],
  );
  return (
    <Form.Group
      className={classNames(
        props.className,
        props.spaceless ? undefined : `mb-${space}`,
      )}
      controlId={controlId}
      id={props.id}
    >
      {props.quickAction || (props.help && props.helpEnd) ? (
        <div className="d-flex align-items-end">
          {!!props.label && <FormLabel {...props} />}
          {props.quickAction}
          {props.help && props.helpEnd && (
            <Tip
              id={uniqueId('form-field-tooltip-')}
              className="align-self-center ms-2 mb-2"
              label={props.help}
            >
              <QuestionIcon
                weight="bold"
                size={16}
                className="text-muted"
                data-testid="question-icon"
              />
            </Tip>
          )}
        </div>
      ) : props.label ? (
        <FormLabel {...props} />
      ) : null}
      <div>{props.children}</div>
      {props.description && <Form.Text>{props.description}</Form.Text>}
      {props.meta?.touched && props.meta?.error && (
        <FieldError error={props.meta.error} />
      )}
    </Form.Group>
  );
};
