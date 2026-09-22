import classNames from 'classnames';
import { ProgressBar } from 'react-bootstrap';

export const QuotaProgressBar = ({
  percent,
  height = undefined,
  className = undefined,
  label,
}: {
  percent: number;
  height?: number;
  className?: string;
  label?: string;
}) => {
  return (
    <ProgressBar
      variant={percent < 33 ? 'primary' : percent < 66 ? 'warning' : 'danger'}
      now={percent}
      aria-label={label}
      className={classNames('w-100', height && `h-${height}px`, className)}
    />
  );
};
