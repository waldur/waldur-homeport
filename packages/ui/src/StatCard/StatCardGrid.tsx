import { cn } from '../cn';

import { StatCard, type StatCardProps } from './StatCard';

export type StatCardGridItem = Pick<
  StatCardProps,
  'label' | 'value' | 'footer' | 'link' | 'icon' | 'tone'
>;

// One column on phones. Two or three tiles share a row from `sm`; four or
// more go two to a row from `sm` and all on one row from `lg`, so five or six
// tiles are never squeezed into a 640px-wide row. Six or more wrap six to a
// row.
const getLayoutClassName = (count: number) => {
  if (count <= 1) return 'grid-cols-1';
  if (count === 2) return 'grid-cols-1 sm:grid-cols-2';
  if (count === 3) return 'grid-cols-1 sm:grid-cols-3';
  if (count === 4) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
  if (count === 5) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5';
  return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-6';
};

export interface StatCardGridProps {
  /** One `StatCard` per item, its props passed straight through. */
  stats: StatCardGridItem[];
  /** Every tile's size; `sm` for a dense grid inside another card. */
  size?: StatCardProps['size'];
  className?: string;
  /**
   * Drops the default bottom margin, for when whatever follows brings its own
   * top spacing.
   */
  spaceless?: boolean;
}

/**
 * A row of `StatCard`s, with the column count picked from how many there
 * are. Every KPI row in HomePort that is a plain list of figures is one.
 */
export const StatCardGrid = ({
  stats,
  size,
  className,
  spaceless,
}: StatCardGridProps) => (
  <div
    className={cn(
      'grid gap-3',
      getLayoutClassName(stats.length),
      !spaceless && 'mb-4',
      className,
    )}
  >
    {stats.map((stat, index) => (
      <StatCard key={index} size={size} {...stat} />
    ))}
  </div>
);
