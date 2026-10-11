import { Progress, type ProgressSize } from 'waldur-ui';

export const QuotaProgressBar = ({
  percent,
  size,
  className = undefined,
  label,
}: {
  percent: number;
  size?: ProgressSize;
  className?: string;
  label?: string;
}) => (
  <Progress
    value={percent}
    variant={percent < 33 ? 'primary' : percent < 66 ? 'warning' : 'danger'}
    size={size}
    className={className}
    label={label}
  />
);
