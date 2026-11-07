import { forwardRef } from 'react';

import { cn } from '../cn';
import { FieldContext } from '../Form/controlId';

import { NumberInput, NumberInputProps } from './NumberInput';
import { RangeInput } from './RangeInput';

export interface SliderNumberInputProps extends Omit<
  NumberInputProps,
  'className'
> {
  /** `0` by default: the slider needs both ends. */
  min?: number | string;
  /** `100` by default. */
  max?: number | string;
  /** On the row holding the slider and the field. */
  className?: string;
}

/**
 * A number field with a slider beside it, for a value picked from a range
 * (a VM's cores, its memory). The field is the control: the label names it,
 * the keyboard and screen readers use it, it clamps and shows the unit. The
 * slider is a pointer shortcut that follows it, so it stays out of the field
 * (no id, no label) and out of the tab order. An empty field leaves the
 * slider at `min`.
 */
export const SliderNumberInput = forwardRef<
  HTMLInputElement,
  SliderNumberInputProps
>(
  (
    {
      value,
      onValueChange,
      min = 0,
      max = 100,
      step,
      disabled,
      className,
      ...props
    },
    ref,
  ) => {
    const minNum = Number(min);
    const maxNum = Number(max);
    const num = Number(value);
    const sliderValue =
      value === null || value === undefined || value === '' || isNaN(num)
        ? minNum
        : Math.min(Math.max(num, minNum), maxNum);
    return (
      <div className={cn('flex items-center gap-5', className)}>
        <FieldContext.Provider value={null}>
          <RangeInput
            aria-hidden="true"
            tabIndex={-1}
            value={sliderValue}
            min={minNum}
            max={maxNum}
            step={Number(step) > 0 ? Number(step) : 1}
            disabled={disabled}
            onChange={(e) => onValueChange?.(Number(e.target.value))}
            className="flex-1"
          />
        </FieldContext.Provider>
        <div className="w-40 shrink-0">
          <NumberInput
            ref={ref}
            value={value}
            onValueChange={onValueChange}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            {...props}
          />
        </div>
      </div>
    );
  },
);
SliderNumberInput.displayName = 'SliderNumberInput';
