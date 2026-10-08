import classNames from 'classnames';

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
  // 0/0 quotas yield NaN, an invalid aria-valuenow that screen readers skip.
  const value = Number.isFinite(percent) ? percent : 0;
  const variant = value < 33 ? 'primary' : value < 66 ? 'warning' : 'danger';
  // The full-width track carries the role, so screen readers can reach it
  // even when the filled part is 0px wide.
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className={classNames(
        'progress w-100',
        height && `h-${height}px`,
        className,
      )}
    >
      <div
        className={`progress-bar bg-${variant}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
};
