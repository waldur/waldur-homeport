import { ProgressBar } from 'react-bootstrap';

export const QuotaProgressBar = ({
  percent,
  height = 4,
  className = undefined,
}) => {
  return (
    <ProgressBar
      variant={percent < 33 ? 'primary' : percent < 66 ? 'warning' : 'danger'}
      now={percent}
      className={
        `h-${height}px resource-progress shadow-none w-100` +
        (className ? ' ' + className : '')
      }
    />
  );
};
