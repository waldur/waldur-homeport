import { FC, forwardRef, ReactNode } from 'react';
import { FieldRenderProps } from 'react-final-form';
import { cn, Input, InputGroup, InputProps } from 'waldur-ui';

// ── Base (Pure UI) ──────────────────────────────────────

/**
 * A read-only value shown as text: no border or fill, flush left, and no
 * focus ring (Bootstrap's `.form-control-plaintext`).
 */
const PLAINTEXT_CLASS =
  'border-transparent bg-transparent [&[readonly]]:bg-transparent pl-0 pr-0 text-secondary focus:border-transparent focus:[box-shadow:none]';

export interface BaseInputFieldProps extends Omit<InputProps, 'invalid'> {
  isInvalid?: boolean;
  /** Pair with `readOnly`: shows the value as plain text. */
  plaintext?: boolean;
  /** Drawn inside the left edge, e.g. a search icon. */
  start?: ReactNode;
  /** Drawn inside the right edge: a unit, a button. */
  end?: ReactNode;
  /** Classes for the wrapper that holds the field and its adornments:
   * widths and margins that place it in its row. `className` goes on the
   * `<input>`. */
  containerClassName?: string;
}

export const BaseInputField = forwardRef<HTMLInputElement, BaseInputFieldProps>(
  (
    {
      isInvalid,
      plaintext,
      start,
      end,
      className,
      containerClassName,
      ...props
    },
    ref,
  ) => (
    <InputGroup
      start={start}
      end={end}
      invalid={isInvalid}
      className={containerClassName}
    >
      <Input
        ref={ref}
        invalid={isInvalid}
        className={cn(plaintext && PLAINTEXT_CLASS, className)}
        {...props}
      />
    </InputGroup>
  ),
);
BaseInputField.displayName = 'BaseInputField';

// ── Field Adapter ───────────────────────────────────────

export interface InputFieldProps extends Omit<
  BaseInputFieldProps,
  'value' | 'onChange' | 'onBlur' | 'onFocus' | 'name'
> {
  input: FieldRenderProps<any>['input'];
  meta: FieldRenderProps<any>['meta'];
}

export const InputField: FC<InputFieldProps> = ({ input, meta, ...rest }) => (
  <BaseInputField
    isInvalid={meta.touched && !!meta.error}
    {...rest}
    {...input}
  />
);
