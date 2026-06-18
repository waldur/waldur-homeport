import classNames from 'classnames';
import { FC } from 'react';
import { Form, FormControlProps } from 'react-bootstrap';
import { FieldRenderProps } from 'react-final-form';

// ── Base (Pure UI) ──────────────────────────────────────

interface BaseEmailFieldProps extends FormControlProps {
  solid?: boolean;
  isInvalid?: boolean;
}

const BaseEmailField: FC<BaseEmailFieldProps> = ({
  solid,
  className,
  ...rest
}) => (
  <Form.Control
    type="email"
    className={classNames(solid && 'form-control-solid', className)}
    {...rest}
  />
);

// ── Field Adapter ───────────────────────────────────────

export interface EmailFieldProps extends Omit<
  BaseEmailFieldProps,
  'value' | 'onChange' | 'onBlur' | 'onFocus' | 'name'
> {
  input: FieldRenderProps<any>['input'];
  meta: FieldRenderProps<any>['meta'];
}

export const EmailField: FC<EmailFieldProps> = ({ input, meta, ...rest }) => (
  <BaseEmailField isInvalid={meta.touched && meta.error} {...rest} {...input} />
);
