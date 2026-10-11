import classNames from 'classnames';
import { FC } from 'react';

import { Progress, progressPercent, type ProgressProps } from 'waldur-ui';

interface PercentProgressProps {
  value: number;
  /** The value that fills the whole bar; defaults to 100. */
  max?: number;
  variant?: ProgressProps['variant'];
  /** Suffix of the figure under the bar. */
  unit?: string;
  /** Smaller figure with less spacing, for table cells. */
  compact?: boolean;
  /** Accessible name of the bar. */
  label?: string;
}

/** A `Progress` with its share of `max` printed under it, right-aligned. */
export const PercentProgress: FC<PercentProgressProps> = ({
  value,
  max = 100,
  variant,
  unit = '%',
  compact,
  label,
}) => {
  const percent = progressPercent(value, max);
  return (
    <div className="d-flex flex-column">
      <Progress value={value} max={max} variant={variant} label={label} />
      <span
        className={classNames(
          'd-block text-end text-secondary',
          compact ? 'fs-7' : 'fs-6 mt-2',
        )}
      >
        {Number.isInteger(percent) ? percent : percent.toFixed(1)}
        {unit}
      </span>
    </div>
  );
};
