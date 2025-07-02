import { QuestionIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import {
  cloneElement,
  FC,
  PropsWithChildren,
  ReactNode,
  useContext,
  useEffect,
} from 'react';
import { Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { clearFields, WrappedFieldMetaProps } from 'redux-form';

import { Tip } from '@waldur/core/Tooltip';

import { FormFieldsContext } from './context';
import { FieldError } from './FieldError';
import { FormField } from './types';

export interface FormGroupProps extends FormField {
  meta: WrappedFieldMetaProps;
  clearOnUnmount?: boolean;
  actions?: ReactNode;
  quickAction?: ReactNode;
  tooltipEnd?: boolean;
}

export const FormGroup: FC<PropsWithChildren<FormGroupProps>> = (props) => {
  const context = useContext(FormFieldsContext);
  const dispatch = useDispatch();

  const {
    input,
    required,
    label,
    description,
    tooltip,
    tooltipEnd,
    hideLabel,
    meta,
    children,
    actions,
    quickAction,
    clearOnUnmount,
    spaceless,
    containerClassName,
    space = 7,
    ...rest
  } = props;

  useEffect(() => {
    return () => {
      if (clearOnUnmount === false) {
        return;
      }
      dispatch(clearFields(meta.form, false, false, input.name));
    };
  }, []);

  const newProps = {
    input,
    ...rest,
    readOnly: context.readOnlyFields.includes(input.name) || rest.readOnly,
    onBlur: (event) => {
      if (!props.noUpdateOnBlur) {
        props.input.onBlur(event);
      }
    },
    isInvalid: meta.touched && !!meta.error,
  };

  const labelNode = !hideLabel && (
    <Form.Label className={classNames({ required })}>
      {tooltip && !tooltipEnd && (
        <Tip id={'form-field-tooltip-' + input.name} label={tooltip}>
          <QuestionIcon weight="bold" size={20} className="text-muted" />{' '}
        </Tip>
      )}
      {label}
    </Form.Label>
  );

  const mainContent = (
    <div
      className={classNames(
        {
          'flex-grow-1': Boolean(actions),
        },
        'position-relative',
        !actions && containerClassName,
        !spaceless && `mb-${space}`,
      )}
    >
      {quickAction || (tooltip && tooltipEnd) ? (
        <div className="d-flex align-items-end">
          <span className="me-auto">{labelNode}</span>
          {props.quickAction}
          {tooltip && tooltipEnd && (
            <Tip
              id={'form-field-tooltip-' + input.name}
              className="align-self-center ms-2"
              label={tooltip}
            >
              <QuestionIcon weight="bold" size={20} className="text-muted" />
            </Tip>
          )}
        </div>
      ) : (
        labelNode
      )}
      {cloneElement(children as any, newProps)}
      {description && (
        <Form.Text className="text-muted">{description}</Form.Text>
      )}
      {meta.touched && <FieldError error={meta.error} />}
    </div>
  );

  if (actions) {
    return (
      <div
        className={classNames(
          'd-flex align-items-start gap-4',
          containerClassName,
        )}
      >
        {mainContent}
        {actions}
      </div>
    );
  }
  return mainContent;
};
