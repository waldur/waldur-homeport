import { FC } from 'react';
import { Form, FormControlProps } from 'react-bootstrap';
import { FieldRenderProps } from 'react-final-form';

import { translate } from '@/i18n';

// ── Base (Pure UI) ──────────────────────────────────────

interface BaseCommaSeparatedListFieldProps extends Omit<
  FormControlProps,
  'value' | 'onChange' | 'onBlur'
> {
  /** The current array value */
  value?: string[];
  /** Called with the parsed array on every keystroke */
  onChange?: (value: string[]) => void;
  /** Called on blur after filtering empty entries */
  onBlur?: (e: React.FocusEvent) => void;
  placeholder?: string;
  solid?: boolean;
  separator?: 'comma' | 'space';
}

const BaseCommaSeparatedListField: FC<BaseCommaSeparatedListFieldProps> = ({
  value: valueProp,
  onChange: onChangeProp,
  onBlur: onBlurProp,
  placeholder = translate('Enter comma-separated values'),
  solid,
  separator: sep = 'comma',
  ...rest
}) => {
  const displayValue = Array.isArray(valueProp)
    ? valueProp.join(sep === 'comma' ? ', ' : ' ')
    : valueProp;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const parsedValue = newValue
      .split(sep === 'comma' ? ',' : ' ')
      .map((item) => item.trim());
    onChangeProp?.(parsedValue);
  };

  const handleBlur = (e: React.FocusEvent) => {
    const parsedValue = (valueProp || []).filter(
      (item) => !['', undefined, null].includes(item),
    );
    onChangeProp?.(parsedValue);
    onBlurProp?.(e);
  };

  return (
    <Form.Control
      className={solid && 'form-control-solid'}
      type="text"
      placeholder={placeholder}
      {...rest}
      value={displayValue || ''}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
};

// ── Field Adapter ───────────────────────────────────────

export interface CommaSeparatedListFieldProps extends Omit<
  BaseCommaSeparatedListFieldProps,
  'value' | 'onChange' | 'onBlur' | 'name'
> {
  input: FieldRenderProps<any>['input'];
  meta: FieldRenderProps<any>['meta'];
}

export const CommaSeparatedListField: FC<CommaSeparatedListFieldProps> = ({
  input,
  meta,
  ...rest
}) => (
  <BaseCommaSeparatedListField
    isInvalid={meta.touched && meta.error}
    {...rest}
    {...input}
  />
);
