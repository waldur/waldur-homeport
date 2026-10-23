import { FC, ReactNode } from 'react';
import { FieldRenderProps } from 'react-final-form';

import { BaseInputField, BaseInputFieldProps } from './InputField';

// ── Base (Pure UI) ──────────────────────────────────────

export interface BaseStringFieldProps extends BaseInputFieldProps {
  icon?: ReactNode;
}

export const BaseStringField: FC<BaseStringFieldProps> = ({
  icon,
  ...rest
}) => (
  <BaseInputField
    type="text"
    start={icon && <span className="[&>svg]:size-[20px]">{icon}</span>}
    {...rest}
  />
);

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
    isInvalid={meta.touched && !!meta.error}
    {...rest}
    {...input}
    onChange={(e) => input.onChange(e.target.value)}
  />
);
