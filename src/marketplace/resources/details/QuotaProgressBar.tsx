import classNames from 'classnames';
import { ProgressBar } from 'react-bootstrap';

export const QuotaProgressBar = ({
  percent,
  height = undefined,
  className = undefined,
}) => {
  return (
    <ProgressBar
      variant={percent < 33 ? 'primary' : percent < 66 ? 'warning' : 'danger'}
      now={percent}
      className={classNames('w-100', height && `h-${height}px`, className)}
    />
  );
};
