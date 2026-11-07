import { FC, forwardRef } from 'react';
import { FieldRenderProps } from 'react-final-form';

import { InputGroup, Textarea, TextareaProps } from 'waldur-ui';

import { useCharacterCount } from './CharacterCount';

// ── Base (Pure UI) ──────────────────────────────────────

interface BaseTextFieldProps extends Omit<TextareaProps, 'invalid'> {
  isInvalid?: boolean;
  /** Classes for the wrapper: widths and margins that place the field in its
   * row. `className` goes on the `<textarea>`. */
  containerClassName?: string;
  /** Show a live counter under the textarea: `n / maxLength` with a native
   * `maxLength`, the length alone without one. */
  showCharacterCount?: boolean;
  /** Shows `n / max` under the control. Unlike the native `maxLength`, it does
   * not cut the text: pair it with a validator so an overlong value is
   * refused in the open rather than truncated. */
  maxCharacters?: number;
  /** The value is as it was loaded, so an overrun it arrived with is shown in
   * grey rather than as an error. */
  pristine?: boolean;
}

export const BaseTextField = forwardRef<
  HTMLTextAreaElement,
  BaseTextFieldProps
>(
  (
    {
      rows = 5,
      isInvalid,
      className,
      containerClassName,
      showCharacterCount,
      maxCharacters,
      pristine,
      ...rest
    },
    ref,
  ) => {
    const { describedBy, counter } = useCharacterCount({
      showCharacterCount,
      maxLength: rest.maxLength,
      maxCharacters,
      pristine,
      value: rest.value,
      describedBy: rest['aria-describedby'],
    });
    const control = (
      <InputGroup
        invalid={isInvalid}
        align="top"
        className={containerClassName}
      >
        <Textarea
          ref={ref}
          invalid={isInvalid}
          rows={rows}
          className={className}
          {...rest}
          aria-describedby={describedBy}
        />
      </InputGroup>
    );
    return counter ? (
      <>
        {control}
        {counter}
      </>
    ) : (
      control
    );
  },
);
BaseTextField.displayName = 'BaseTextField';

// ── Field Adapter ───────────────────────────────────────

export interface TextFieldProps extends Omit<
  BaseTextFieldProps,
  'value' | 'onChange' | 'onBlur' | 'onFocus' | 'name' | 'pristine'
> {
  input: FieldRenderProps<any>['input'];
  meta: FieldRenderProps<any>['meta'];
}

export const TextField: FC<TextFieldProps> = ({ input, meta, ...rest }) => (
  <BaseTextField
    isInvalid={meta.touched && !!meta.error}
    pristine={meta.pristine}
    {...rest}
    {...input}
  />
);
