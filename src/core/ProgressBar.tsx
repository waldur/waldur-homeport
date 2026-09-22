import classNames from 'classnames';
import { FC } from 'react';
import {
  ProgressBar as BsProgressBar,
  ProgressBarProps as BsProgressBarProps,
  Stack,
} from 'react-bootstrap';

interface ProgressBarProps extends BsProgressBarProps {
  unit?: string;
  showValue?: boolean;
  compact?: boolean;
  /**
   * Keep the default grey track instead of tinting it with `variant`. A tinted
   * track is indistinguishable from a filled bar at a glance — on a meter that
   * spends time at zero (a capacity indicator, say) an empty bar would
   * otherwise read as a full one, differing only in hue.
   */
  neutralTrack?: boolean;
}

export const ProgressBar: FC<ProgressBarProps> = ({
  now,
  max = 100,
  showValue,
  compact,
  unit = '%',
  variant,
  neutralTrack,
  className,
}) => {
  const value = Number((now / max) * 100) || 0;
  return (
    <Stack>
      <BsProgressBar
        now={now}
        max={max}
        className={classNames(
          'w-100 mt-1',
          variant && !neutralTrack && `bg-light-${variant}`,
          className,
        )}
        variant={variant}
      />
      {showValue && (
        <span
          className={classNames(
            'd-block text-end text-secondary',
            compact ? 'fs-7' : 'fs-6 mt-2',
          )}
        >
          {max ? (Number.isInteger(value) ? value : value.toFixed(1)) : now}
          {unit}
        </span>
      )}
    </Stack>
  );
};
