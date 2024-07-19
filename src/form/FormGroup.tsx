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
    floating = false,
    actions,
    clearOnUnmount,
    spaceless,
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
          'form-floating': floating,
          'flex-grow-1': Boolean(actions),
        },
        'position-relative',
        !spaceless && 'mb-7',
      )}
    >
      {!floating && labelNode}
      {cloneElement(children as any, newProps)}
      {floating && labelNode}
      {description && <Form.Text>{description}</Form.Text>}
      {meta.touched && <FieldError error={meta.error} />}
    </div>
  );
  if (actions) {
    return (
      <div className="d-flex align-items-start gap-4">
        {main}
        {actions}
      </div>
    );
  }
  return main;
};
