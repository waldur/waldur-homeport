import { ReactNode } from 'react';

import { Card, CardContent } from '../Card';
import { cn } from '../cn';

export type StatCardTone = 'success' | 'warning' | 'danger';

const TONE_CLASSES: Record<StatCardTone, string> = {
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
};

/**
 * The one tile for a single figure: a label, the value under it and an
 * optional footer row. Every KPI row in HomePort draws it, directly or
 * through `StatCardGrid`, which lays a row of them out.
 *
 * The tile fills its grid cell (`h-full`) and the value grows, so footers
 * line up along the bottom of a row whose tiles have different content.
 *
 * The figure carries `data-testid="stat-card-value"`, so a test can read a
 * row of figures in order.
 *
 * Not for a figure with a chart under it (`WidgetCard`), nor for label/value
 * pairs about one object (`PropertyCard`).
 */
export interface StatCardProps {
  label: ReactNode;
  value: ReactNode;
  /** A glyph in the top-right corner, naming what the figure measures. */
  icon?: ReactNode;
  /**
   * The row under the value: a delta badge, a comparison, a caption, a
   * "View all" link. Plain text in it is muted; a Badge keeps its colours.
   */
  footer?: ReactNode;
  /**
   * Colours the value when the figure itself is a verdict (no alerts, over
   * budget). Colour is never the only signal: say it in the label, the
   * footer or an icon in the value too.
   */
  tone?: StatCardTone;
  /**
   * `sm` is the compact tile for dense grids of figures (five or six to a
   * row, often inside another card): an 18px value that wraps rather than
   * overflowing, and a 12px label and footer.
   */
  size?: 'md' | 'sm';
  className?: string;
}

export const StatCard = ({
  label,
  value,
  icon,
  footer,
  tone,
  size = 'md',
  className,
}: StatCardProps) => (
  <Card bordered className={cn('h-full', className)}>
    <CardContent
      className={cn(
        'flex flex-col',
        size === 'sm' ? 'min-w-0 p-[1rem]' : 'py-4',
      )}
    >
      <div className="flex items-start justify-between gap-1.5">
        <div
          className={cn(
            'font-medium',
            size === 'sm' ? 'text-xs text-tertiary' : 'text-sm text-quaternary',
          )}
        >
          {label}
        </div>
        {icon}
      </div>
      <div
        data-testid="stat-card-value"
        className={cn(
          'grow',
          tone ? TONE_CLASSES[tone] : 'text-primary',
          size === 'sm'
            ? 'mt-[0.25rem] text-lg font-semibold break-words'
            : 'mt-2.5 text-3xl font-bold',
        )}
      >
        {value}
      </div>
      {footer && (
        <div
          className={cn(
            'flex flex-wrap items-center gap-1.5 text-tertiary',
            size === 'sm' ? 'mt-[0.25rem] text-xs' : 'mt-1.5 text-sm',
          )}
        >
          {footer}
        </div>
      )}
    </CardContent>
  </Card>
);
