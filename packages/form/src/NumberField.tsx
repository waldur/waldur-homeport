import { CSSProperties, FC } from 'react';
import { FieldRenderProps } from 'react-final-form';
import { NumberInput } from 'waldur-ui';

// ── Base (Pure UI) ──────────────────────────────────────

interface BaseNumberFieldProps {
  value?: number | string;
  onChange?: (value: number | string) => void;
  onBlur?: () => void;
  name?: string;
  style?: CSSProperties;
  step?: number | string;
  min?: number | string;
  max?: number | string;
  unit?: string;
  placeholder?: string;
  solid?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  id?: string;
  isInvalid?: boolean;
  /**
   * The up/down carets. They move by `step`, which a price cannot use: seven
   * decimals of precision make the caret's move invisible, and raising `step`
   * would make those decimals invalid.
   */
  showSteppers?: boolean;
}

export const BaseNumberField: FC<BaseNumberFieldProps> = ({
  onChange,
  isInvalid,
  solid,
  ...rest
}) => (
  <NumberInput
    onValueChange={onChange}
    invalid={isInvalid}
    solid={solid}
    {...rest}
  />
);

// ── Field Adapter ───────────────────────────────────────

export interface NumberFieldProps extends Omit<
  BaseNumberFieldProps,
  'value' | 'onChange' | 'onBlur' | 'name'
> {
  input: FieldRenderProps<any>['input'];
  meta: FieldRenderProps<any>['meta'];
}

export const NumberField: FC<NumberFieldProps> = ({ input, meta, ...rest }) => (
  <BaseNumberField
    isInvalid={meta.touched && !!meta.error}
    {...rest}
    {...input}
  />
);
