import { FC, ReactNode } from 'react';
import { FieldRenderProps } from 'react-final-form';

import { useCharacterCount } from './CharacterCount';
import { BaseInputField, BaseInputFieldProps } from './InputField';

// ── Base (Pure UI) ──────────────────────────────────────

export interface BaseStringFieldProps extends BaseInputFieldProps {
  icon?: ReactNode;
  /** Show a live counter under the input: `n / maxLength` with a native
   * `maxLength`, the length alone without one. */
  showCharacterCount?: boolean;
}

export const BaseStringField: FC<BaseStringFieldProps> = ({
  icon,
  showCharacterCount,
  ...rest
}) => {
  const { describedBy, counter } = useCharacterCount({
    showCharacterCount,
    maxLength: rest.maxLength,
    value: rest.value,
    describedBy: rest['aria-describedby'],
  });
  const field = (
    <BaseInputField
      type="text"
      start={icon && <span className="[&>svg]:size-[20px]">{icon}</span>}
      {...rest}
      aria-describedby={describedBy}
    />
  );
  return counter ? (
    <>
      {field}
      {counter}
    </>
  ) : (
    field
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
    isInvalid={meta.touched && !!meta.error}
    {...rest}
    {...input}
    onChange={(e) => input.onChange(e.target.value)}
  />
);
