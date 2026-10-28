import classNames from 'classnames';
import { ReactNode } from 'react';

import { StatsCard } from './StatsCard';

// Up to five tiles share one row from `sm` up (full width below), and six or
// more wrap six to a row.
const getLayoutClassName = (count: number) => {
  if (count <= 1) return 'grid grid-cols-1';
  if (count === 2) return 'grid grid-cols-1 sm:grid-cols-2';
  if (count === 3) return 'grid grid-cols-1 sm:grid-cols-3';
  if (count === 4) return 'grid grid-cols-1 sm:grid-cols-4';
  if (count === 5) return 'grid grid-cols-1 sm:grid-cols-5';
  return 'grid grid-cols-1 sm:grid-cols-6';
};

export const SummaryWidget = ({
  stats,
  className,
  spaceless,
}: {
  stats: Array<{ label: ReactNode; value: ReactNode; footer?: ReactNode }>;
  className?: string;
  /**
   * Drops the default bottom margin, for when whatever follows brings its own
   * top spacing. It has to be a prop rather than an `mb-0` in `className`:
   * two margin classes on one element apply in stylesheet order, not in the
   * order they are written, so `mb-0` would not reliably beat `mb-4`.
   */
  spaceless?: boolean;
}) => {
  return (
    <div
      className={classNames(
        'gap-3',
        getLayoutClassName(stats.length),
        !spaceless && 'mb-4',
        className,
      )}
    >
      {stats.map((stat, index) => (
        <StatsCard
          key={index}
          label={stat.label}
          value={stat.value}
          footer={stat.footer}
        />
      ))}
    </div>
  );
};
