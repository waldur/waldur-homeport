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
  ...rest
}) => {
  const minNum = Number(min ?? -Infinity);
  const maxNum = Number(max ?? Infinity);

  const changeBy = (by: number) =>
    onChange?.(clamp(Number(value || 0) + by, minNum, maxNum));

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
        <CaretUpDownButtons
          onClickUp={() => changeBy(1)}
          onClickDown={() => changeBy(-1)}
        />
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
