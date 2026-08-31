import classNames from 'classnames';
import { FC, ReactNode } from 'react';
import { Form, FormControlProps, InputGroup } from 'react-bootstrap';
import { FieldRenderProps } from 'react-final-form';

// ── Base (Pure UI) ──────────────────────────────────────

export interface BaseStringFieldProps extends FormControlProps {
  solid?: boolean;
  icon?: ReactNode;
}

export const BaseStringField: FC<BaseStringFieldProps> = ({
  solid = false,
  placeholder = ' ',
  icon,
  className,
  ...rest
}) => {
  const control = (
    <Form.Control
      className={classNames(solid && 'form-control-solid', className)}
      type="text"
      placeholder={placeholder}
      {...rest}
    />
  );
  return !icon ? (
    control
  ) : (
    <InputGroup className="has-icon">
      <div className="input-group-icon">{icon}</div>
      {control}
    </InputGroup>
  );
};

// ── Field Adapter ───────────────────────────────────────

export interface StringFieldProps extends Omit<
  BaseStringFieldProps,
  'value' | 'onChange' | 'onBlur' | 'onFocus' | 'name'
> {
  input: FieldRenderProps<any>['input'];
  meta: FieldRenderProps<any>['meta'];
}

export const StringField: FC<StringFieldProps> = ({ input, meta, ...rest }) => (
  <BaseStringField
    isInvalid={meta.touched && meta.error}
    {...rest}
    {...input}
    onChange={(e) => input.onChange(e.target.value)}
  />
);
