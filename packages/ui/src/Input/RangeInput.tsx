import { CSSProperties, forwardRef, InputHTMLAttributes } from 'react';

import { cn } from '../cn';
import { useControlId, useDescribedBy } from '../Form/controlId';

export interface RangeInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size'
> {
  /** `0` by default, as for a native range input. */
  min?: number;
  /** `100` by default. */
  max?: number;
  step?: number | 'any';
}

// The native track is drawn transparent, so the filled part is this
// background; --range-progress is the thumb's position as a percentage.
const TRACK =
  'm-0 h-[4px] w-full cursor-pointer appearance-none rounded-[2px] border-0 bg-transparent p-0 ' +
  '[background:linear-gradient(to_right,var(--bg-brand-solid)_0,var(--bg-brand-solid)_var(--range-progress,0%),var(--bg-quaternary)_var(--range-progress,0%),var(--bg-quaternary)_100%)] ' +
  '[&::-webkit-slider-runnable-track]:h-[4px] [&::-webkit-slider-runnable-track]:appearance-none [&::-webkit-slider-runnable-track]:border-0 [&::-webkit-slider-runnable-track]:bg-transparent ' +
  '[&::-moz-range-track]:h-[4px] [&::-moz-range-track]:border-0 [&::-moz-range-track]:bg-transparent ' +
  '[&::-webkit-slider-thumb]:-mt-[5px] [&::-webkit-slider-thumb]:size-[14px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:bg-[var(--bg-brand-solid)] ' +
  '[&::-moz-range-thumb]:size-[14px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[var(--bg-brand-solid)] ' +
  'focus-visible:outline-[2px] focus-visible:outline-solid focus-visible:outline-[var(--focus-ring-color)] focus-visible:outline-offset-[4px] ' +
  'disabled:cursor-not-allowed disabled:opacity-60';

/**
 * A native range slider with a token-coloured track that fills up to the
 * thumb. Controlled by `value` (the fill follows it); `onChange` is the
 * input's own change event.
 */
export const RangeInput = forwardRef<HTMLInputElement, RangeInputProps>(
  ({ min = 0, max = 100, value, className, style, id, ...props }, ref) => {
    const span = max - min;
    const progress =
      value !== undefined && span > 0
        ? Math.min(100, Math.max(0, ((Number(value) - min) / span) * 100))
        : 0;
    return (
      <input
        ref={ref}
        id={useControlId(id)}
        type="range"
        min={min}
        max={max}
        value={value}
        className={cn(TRACK, className)}
        style={
          { '--range-progress': `${progress}%`, ...style } as CSSProperties
        }
        {...props}
        aria-describedby={useDescribedBy(props['aria-describedby'])}
      />
    );
  },
);
RangeInput.displayName = 'RangeInput';
