import { PhoneIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import { FieldRenderProps } from 'react-final-form';

import { formatPhoneNumber } from '@/core/utils';

import { BaseInputField, BaseInputFieldProps } from './InputField';

// ── Base (Pure UI) ──────────────────────────────────────

type BasePhoneNumberFieldProps = Omit<BaseInputFieldProps, 'type' | 'start'>;

const BasePhoneNumberField: FC<BasePhoneNumberFieldProps> = (props) => (
  <BaseInputField
    type="tel"
    start={
      <span className="[&>svg]:size-[20px]">
        <PhoneIcon weight="bold" />
      </span>
    }
    {...props}
  />
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
      isInvalid={meta.touched && !!meta.error}
      {...rest}
      {...input}
      onBlur={handleBlur}
    />
  );
};
