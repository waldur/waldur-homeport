import { forwardRef } from 'react';
import { translate } from 'waldur-i18n-runtime';

import { Input, InputProps } from './Input';
import { InputGroup } from './InputGroup';

// The stepper glyphs are the filled chevrons the field has always had: a 2:1
// box drawn at 20x10, a little wider and heavier than a Phosphor caret.
const StepperGlyph = ({ d }: { d: string }) => (
  <svg
    aria-hidden="true"
    width="20"
    height="10"
    viewBox="0 0 256 128"
    fill="currentColor"
  >
    <path d={d} />
  </svg>
);
const UP_PATH =
  'M 126 45 l 39.51 39.52 a 12 12 0 0 0 17 -17 l -48 -48 a 12 12 0 0 0 -17 0 l -48 48 a 12 12 0 0 0 17 17 Z';
const DOWN_PATH =
  'M 184.49 39.51 a 12 12 0 0 1 0 17 l -48 48 a 12 12 0 0 1 -17 0 l -48 -48 a 12 12 0 0 1 17 -17 L 128 79 l 39.51 -39.52 A 12 12 0 0 1 184.49 39.51 Z';

export interface NumberInputProps extends Omit<
  InputProps,
  'type' | 'value' | 'onChange' | 'min' | 'max' | 'step'
> {
  value?: number | string | null;
  /** Called with the typed text (a string, possibly empty), a number after a
   * stepper click, or the clamped number when the field is left out of range. */
  onValueChange?: (value: number | string) => void;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  /** A unit shown at the right edge, e.g. "GB". */
  unit?: string;
  /**
   * The up/down carets. They move by `step`, which a price cannot use: seven
   * decimals of precision make the caret's move invisible, and raising `step`
   * would make those decimals invalid.
   */
  showSteppers?: boolean;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

// How many decimals a step has: 0.01 has 2. String(1e-7) is "1e-7", which has
// no "." to count, so the exponent is read as well.
const decimalsOf = (n: number) => {
  const [mantissa, exponent] = String(n).split('e');
  const own = (mantissa.split('.')[1] || '').length;
  return Math.max(0, own - Number(exponent || 0));
};

const isEmpty = (v: unknown) =>
  v === null || v === undefined || String(v).trim() === '';

/**
 * A number input with optional steppers and unit, which pulls an out-of-range
 * value back to `min`/`max` when the field is left and shows it as invalid
 * until then. An empty field is neither: it is left empty.
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value,
      onValueChange,
      min,
      max,
      step,
      unit,
      showSteppers = true,
      invalid,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const minNum = Number(min ?? -Infinity);
    const maxNum = Number(max ?? Infinity);

    // The carets move by the input's own step, not always by 1: on a field
    // with step 0.1 a caret that jumps by a whole unit is not the same
    // control the keyboard offers. Rounded to the step's precision because
    // repeated float addition drifts -- 0.1 + 0.2 is 0.30000000000000004,
    // and that would land in the form as the value the user picked.
    const stepNum = Number(step) > 0 ? Number(step) : 1;
    const stepDecimals = decimalsOf(stepNum);
    const changeBy = (by: number) =>
      onValueChange?.(
        Number(
          clamp(Number(value || 0) + by, minNum, maxNum).toFixed(stepDecimals),
        ),
      );

    // The clamped value when `v` is out of range, else false.
    const outOfRange = (v: unknown): number | false => {
      if (isEmpty(v)) return false;
      const num = Number(v);
      if (isNaN(num)) return false;
      const clamped = clamp(num, minNum, maxNum);
      return clamped !== num ? clamped : false;
    };

    const isInvalid = Boolean(invalid) || outOfRange(value) !== false;
    const stepperClass =
      'pointer-events-auto flex cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-quinary hover:text-quaternary';

    return (
      <InputGroup
        invalid={isInvalid}
        end={
          (showSteppers || unit) && (
            <>
              {showSteppers && (
                <span className="mr-[2px] flex flex-col">
                  <button
                    type="button"
                    aria-label={translate('Increase value')}
                    className={`${stepperClass} pt-[6px]`}
                    onClick={() => changeBy(stepNum)}
                  >
                    <StepperGlyph d={UP_PATH} />
                  </button>
                  <button
                    type="button"
                    aria-label={translate('Decrease value')}
                    className={`${stepperClass} pb-[6px]`}
                    onClick={() => changeBy(-stepNum)}
                  >
                    <StepperGlyph d={DOWN_PATH} />
                  </button>
                </span>
              )}
              {unit && <span className="text-sm text-quaternary">{unit}</span>}
            </>
          )
        }
      >
        <Input
          ref={ref}
          type="number"
          value={value ?? ''}
          min={min}
          max={max}
          step={step}
          invalid={isInvalid}
          onChange={(e) => onValueChange?.(e.target.value)}
          onBlur={(e) => {
            const v = outOfRange(value);
            if (v !== false) onValueChange?.(v);
            onBlur?.(e);
          }}
          {...props}
        />
      </InputGroup>
    );
  },
);
NumberInput.displayName = 'NumberInput';
