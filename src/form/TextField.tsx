import { FC, forwardRef } from 'react';
import { FieldRenderProps } from 'react-final-form';

import { InputGroup, Textarea, TextareaProps } from 'waldur-ui';

// ── Base (Pure UI) ──────────────────────────────────────

interface BaseTextFieldProps extends Omit<TextareaProps, 'invalid'> {
  isInvalid?: boolean;
  /** Classes for the wrapper: widths and margins that place the field in its
   * row. `className` goes on the `<textarea>`. */
  containerClassName?: string;
}

export const BaseTextField = forwardRef<
  HTMLTextAreaElement,
  BaseTextFieldProps
>(({ rows = 5, isInvalid, className, containerClassName, ...rest }, ref) => (
  <InputGroup invalid={isInvalid} align="top" className={containerClassName}>
    <Textarea
      ref={ref}
      invalid={isInvalid}
      rows={rows}
      className={className}
      {...rest}
    />
  </InputGroup>
));
BaseTextField.displayName = 'BaseTextField';

// ── Field Adapter ───────────────────────────────────────

export interface TextFieldProps extends Omit<
  BaseTextFieldProps,
  'value' | 'onChange' | 'onBlur' | 'onFocus' | 'name'
> {
  input: FieldRenderProps<any>['input'];
  meta: FieldRenderProps<any>['meta'];
}

export const TextField: FC<TextFieldProps> = ({ input, meta, ...rest }) => (
  <BaseTextField
    isInvalid={meta.touched && !!meta.error}
    {...rest}
    {...input}
  />
);
