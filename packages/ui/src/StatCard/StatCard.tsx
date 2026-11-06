import { ReactNode, useId } from 'react';
import { translate } from 'waldur-i18n-runtime';

import { AppLink } from '../AppLink';
import { buttonVariants } from '../Button';
import { Card, CardContent } from '../Card';
import { cn } from '../cn';

export type StatCardTone = 'success' | 'warning' | 'danger';

/** Where the figure's list lives, for the tile's "View all" link. */
export interface StatCardLink {
  /** What the app's router navigates by: a UI-Router state, a path. */
  to: string;
  params?: object;
  /** The link's text; "View all" by default. */
  label?: string;
}

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
 * A tile with `link` leads to the list behind the figure; the rest of the
 * tile stays plain, so a `HelpIcon` or a footer tooltip keeps working.
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
   * The row under the value: a delta badge, a comparison, a caption.
   * Plain text in it is muted; a Badge keeps its colours.
   */
  footer?: ReactNode;
  /**
   * The list behind the figure. Drawn as "View all" at the end of the footer
   * row, through the app's `LinkProvider` (a plain href without one), and
   * named after the tile: "View all Organizations".
   */
  link?: StatCardLink;
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
  link,
  tone,
  size = 'md',
  className,
}: StatCardProps) => {
  const id = useId();
  const labelId = `${id}-label`;
  const linkId = `${id}-link`;
  return (
    <Card bordered className={cn('h-full', className)}>
      <CardContent
        className={cn(
          'flex flex-col',
          size === 'sm' ? 'min-w-0 p-[1rem]' : 'py-4',
        )}
      >
        <div className="flex items-start justify-between gap-1.5">
          <div
            id={labelId}
            className={cn(
              'font-medium',
              size === 'sm'
                ? 'text-xs text-tertiary'
                : 'text-sm text-quaternary',
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
        {(footer || link) && (
          <div
            className={cn(
              'flex flex-wrap items-center gap-1.5 text-tertiary',
              size === 'sm' ? 'mt-[0.25rem] text-xs' : 'mt-1.5 text-sm',
            )}
          >
            {footer}
            {link && (
              <AppLink
                to={link.to}
                params={link.params}
                id={linkId}
                aria-labelledby={`${linkId} ${labelId}`}
                className={cn(
                  buttonVariants({ variant: 'text-primary', size: 'sm' }),
                  'ms-auto px-0',
                )}
              >
                {/* In a span: the app's Link styles a bare string as an
                    inline anchor. */}
                <span>{link.label ?? translate('View all')}</span>
              </AppLink>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
