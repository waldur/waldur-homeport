import classNames from 'classnames';
import { FC } from 'react';
import { FormControl, FormControlProps } from 'react-bootstrap';
import { FieldRenderProps } from 'react-final-form';

// ── Base (Pure UI) ──────────────────────────────────────

export interface BaseInputFieldProps extends FormControlProps {
  solid?: boolean;
}

export const BaseInputField: FC<BaseInputFieldProps> = ({
  solid,
  className,
  ...props
}) => (
  <FormControl
    className={classNames(solid && 'form-control-solid', className)}
    placeholder="  "
    {...props}
  />
);

// ── Field Adapter ───────────────────────────────────────

export interface InputFieldProps extends Omit<
  BaseInputFieldProps,
  'value' | 'onChange' | 'onBlur' | 'onFocus' | 'name'
> {
  input: FieldRenderProps<any>['input'];
  meta: FieldRenderProps<any>['meta'];
}

export const InputField: FC<InputFieldProps> = ({ input, meta, ...rest }) => (
  <BaseInputField isInvalid={meta.touched && meta.error} {...rest} {...input} />
);
