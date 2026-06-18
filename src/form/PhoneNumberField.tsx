import { PhoneIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import { Form, FormControlProps, InputGroup } from 'react-bootstrap';
import { FieldRenderProps } from 'react-final-form';

import { formatPhoneNumber } from '@/core/utils';

// ── Base (Pure UI) ──────────────────────────────────────

interface BasePhoneNumberFieldProps extends Omit<FormControlProps, 'type'> {
  solid?: boolean;
}

const BasePhoneNumberField: FC<BasePhoneNumberFieldProps> = ({
  solid = false,
  placeholder = ' ',
  className,
  ...rest
}) => (
  <InputGroup className="has-icon">
    <div className="input-group-icon">
      <PhoneIcon weight="bold" />
    </div>
    <Form.Control
      type="tel"
      className={solid ? 'form-control-solid' : className}
      placeholder={placeholder}
      {...rest}
    />
  </InputGroup>
);

// ── Field Adapter ───────────────────────────────────────

export interface PhoneNumberFieldProps extends Omit<
  BasePhoneNumberFieldProps,
  'value' | 'onChange' | 'onBlur' | 'onFocus' | 'name'
> {
  input: FieldRenderProps<any>['input'];
  meta: FieldRenderProps<any>['meta'];
}

export const PhoneNumberField: FC<PhoneNumberFieldProps> = ({
  input,
  meta,
  ...rest
}) => {
  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const formatted = formatPhoneNumber(e.target.value);
      if (formatted && formatted !== e.target.value) {
        input.onChange(formatted);
      }
      input.onBlur(e);
    },
    [input],
  );

  return (
    <BasePhoneNumberField
      isInvalid={meta.touched && meta.error}
      {...rest}
      {...input}
      onBlur={handleBlur}
    />
  );
};
