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
}

export const ProgressBar: FC<ProgressBarProps> = ({
  now,
  max = 100,
  showValue,
  unit = '%',
  variant,
}) => {
  const value = Number((now / max) * 100) || 0;
  return (
    <Stack>
      <BsProgressBar
        now={now}
        max={max}
        className={classNames(
          'h-8px shadow-none w-100 mt-1',
          variant && `bg-light-${variant}`,
        )}
        variant={variant}
      />
      {showValue && (
        <small className="d-block text-end text-gray-700">
          {max ? (Number.isInteger(value) ? value : value.toFixed(1)) : now}
          {unit}
        </small>
      )}
    </Stack>
  );
};
