import { Question } from '@phosphor-icons/react';
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
import { clearFields, WrappedFieldMetaProps } from 'redux-form';

import { Tip } from '@waldur/core/Tooltip';

import { FormFieldsContext } from './context';
import { FieldError } from './FieldError';
import { FormField } from './types';

export interface FormGroupProps extends FormField {
  meta: WrappedFieldMetaProps;
  clearOnUnmount?: boolean;
  actions?: ReactNode;
  containerClassName?: string;
}

export const FormGroup: FC<PropsWithChildren<FormGroupProps>> = (props) => {
  const context = useContext(FormFieldsContext);

  const {
    input,
    required,
    label,
    description,
    tooltip,
    hideLabel,
    meta,
    children,
    actions,
    clearOnUnmount,
    spaceless,
    containerClassName,
    ...rest
  } = props;

  useEffect(() => {
    return () => {
      if (clearOnUnmount === false) {
        return;
      }
      meta.dispatch(clearFields(meta.form, false, false, input.name));
    };
  }, []);

  const newProps = {
    input,
    ...rest,
    readOnly: context.readOnlyFields.includes(input.name),
    onBlur: (event) => {
      if (!props.noUpdateOnBlur) {
        props.input.onBlur(event);
      }
    },
    isInvalid: meta.touched && !!meta.error,
  };
  const labelNode = !hideLabel && (
    <Form.Label className={classNames({ required })}>
      {tooltip && (
        <Tip id="form-field-tooltip" label={tooltip}>
          <Question />{' '}
        </Tip>
      )}
      {label}
    </Form.Label>
  );
  const main = (
    <div
      className={classNames(
        {
          'flex-grow-1': Boolean(actions),
        },
        'position-relative',
        !spaceless && 'mb-7',
        !actions && containerClassName,
      )}
    >
      {labelNode}
      {cloneElement(children as any, newProps)}
      {description && <Form.Text>{description}</Form.Text>}
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
        {main}
        {actions}
      </div>
    );
  }
  return main;
};
