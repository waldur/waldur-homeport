import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

import { cn } from '../cn';

import {
  PROGRESS_FILL,
  PROGRESS_LABEL,
  PROGRESS_SIZE,
  type ProgressSize,
  type ProgressVariant,
} from './progressStyles';

export type { ProgressSize, ProgressVariant };

export interface ProgressSegmentData {
  value: number;
  variant?: ProgressVariant;
  /** Text drawn inside the segment; meant for `size="lg"`. */
  label?: ReactNode;
}

interface ProgressBaseProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'role' | 'aria-label'
> {
  size?: ProgressSize;
  /** The value that fills the whole track. */
  max?: number;
  /** Accessible name of the progress bar. */
  label?: string;
}

type ProgressMode =
  | {
      value: number;
      variant?: ProgressVariant;
      segments?: undefined;
      indeterminate?: undefined;
    }
  | {
      segments: ProgressSegmentData[];
      value?: undefined;
      variant?: undefined;
      indeterminate?: undefined;
    }
  | {
      indeterminate: true;
      variant?: ProgressVariant;
      value?: undefined;
      segments?: undefined;
    };

export type ProgressProps = ProgressBaseProps & ProgressMode;

/**
 * `value` as a 0–100 share of `max`. A non-finite value or a non-positive
 * `max` (a 0/0 quota) gives 0, so `aria-valuenow` is never `NaN`.
 */
export function progressPercent(value: number, max = 100): number {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) {
    return 0;
  }
  return Math.min(100, Math.max(0, (value / max) * 100));
}

/** Segment widths in percent; together they never exceed the track. */
function segmentWidths(segments: ProgressSegmentData[], max: number) {
  let remaining = 100;
  return segments.map((segment) => {
    const width = Math.min(progressPercent(segment.value, max), remaining);
    remaining -= width;
    return width;
  });
}

/**
 * A meter for a known amount (`value`), a stack of amounts (`segments`) or an
 * unknown one (`indeterminate`). The track is always neutral; `variant` only
 * colours the fill. Colours and heights come from `--progress-*` tokens.
 *
 * The track carries `role="progressbar"`, so assistive tech can reach it even
 * when the filled part is zero wide.
 */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value,
      variant = 'primary',
      segments,
      indeterminate,
      size = 'md',
      max = 100,
      label,
      className,
      ...props
    },
    ref,
  ) => {
    const parts: ProgressSegmentData[] = indeterminate
      ? []
      : (segments ?? [{ value: value ?? 0, variant }]);
    const widths = segmentWidths(parts, max);
    const total = widths.reduce((sum, width) => sum + width, 0);

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={indeterminate ? undefined : Math.round(total)}
        data-size={size}
        className={cn(
          'relative flex w-full overflow-hidden bg-[var(--progress-track)]',
          PROGRESS_SIZE[size],
          className,
        )}
        {...props}
      >
        {indeterminate && (
          <div
            data-progress-indeterminate=""
            data-testid="progress-indeterminate"
            className={cn('h-full rounded-[inherit]', PROGRESS_FILL[variant])}
            style={{
              width: 'var(--progress-indeterminate-width)',
              animation:
                'waldur-progress-indeterminate var(--progress-indeterminate-duration) ease-in-out infinite',
            }}
          />
        )}
        {parts.map((part, index) =>
          widths[index] > 0 ? (
            <div
              key={index}
              data-testid="progress-segment"
              className={cn(
                'flex h-full shrink-0 items-center justify-center overflow-hidden whitespace-nowrap',
                '[transition:var(--progress-transition)] last:rounded-r-[inherit]',
                PROGRESS_FILL[part.variant ?? 'primary'],
                PROGRESS_LABEL[part.variant ?? 'primary'],
                index > 0 &&
                  'border-l-[1px] border-[var(--progress-segment-divider)]',
              )}
              style={{ width: `${widths[index]}%` }}
            >
              {part.label}
            </div>
          ) : null,
        )}
      </div>
    );
  },
);
Progress.displayName = 'Progress';
