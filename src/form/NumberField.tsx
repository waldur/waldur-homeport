import classNames from 'classnames';
import { clamp } from 'lodash-es';
import { CSSProperties, FC } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { FieldRenderProps } from 'react-final-form';

import { CaretUpDownButtons } from '@/core/CaretUpDownButtons';

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
  value,
  onChange,
  onBlur,
  name,
  unit,
  placeholder = '  ',
  solid,
  min,
  max,
  step,
  id,
  isInvalid,
  showSteppers = true,
  ...rest
}) => {
  const minNum = Number(min ?? -Infinity);
  const maxNum = Number(max ?? Infinity);

  // The carets move by the input's own step, not always by 1: on a field with
  // step 0.1 a caret that jumps by a whole unit is not the same control the
  // keyboard and the spinner offer. Rounded to the step's precision because
  // repeated float addition drifts -- 0.1 + 0.2 is 0.30000000000000004, and
  // that would land in the form as the value the user picked.
  const stepNum = Number(step) > 0 ? Number(step) : 1;
  const stepDecimals = (String(stepNum).split('.')[1] || '').length;
  const changeBy = (by: number) =>
    onChange?.(
      Number(
        clamp(Number(value || 0) + by, minNum, maxNum).toFixed(stepDecimals),
      ),
    );

  const isOutOfRange = (v) => {
    const num = Number(v);
    if (!isNaN(num)) {
      const clamped = clamp(num, minNum, maxNum);
      return clamped !== num ? clamped : false;
    }
    return false;
  };

  return (
    <InputGroup className="input-group-number">
      <Form.Control
        name={name}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={classNames(
          solid && 'form-control-solid',
          unit && 'has-unit',
        )}
        type="number"
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        id={id}
        onBlur={() => {
          const v = isOutOfRange(value);
          if (v !== false) {
            onChange?.(v);
          }
          onBlur?.();
        }}
        isInvalid={isInvalid || isOutOfRange(value) !== false}
        {...rest}
      />
      <div className="input-group-addons">
        {showSteppers && (
          <CaretUpDownButtons
            onClickUp={() => changeBy(stepNum)}
            onClickDown={() => changeBy(-stepNum)}
          />
        )}
        {unit && (
          <InputGroup.Text className="border-0 unit">{unit}</InputGroup.Text>
        )}
      </div>
    </InputGroup>
  );
};

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
    isInvalid={meta.touched && meta.error}
    {...rest}
    {...input}
  />
);
