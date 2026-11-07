import { Badge, type BadgeVariant } from '../Badge';
import { cn } from '../cn';
import { LoadingSpinner } from '../LoadingSpinner';

/**
 * How a tab's count reads, following the status variants of the UI
 * guidelines: `neutral` for a plain tally (the default), `info` and `success`
 * for something to look at, `warning` for something to fix, `danger` for
 * something that blocks.
 */
export type TabCountVariant =
  'neutral' | 'info' | 'success' | 'warning' | 'danger';

/** The count props a tab takes, shared by `TabsItem`, `TabsTrigger` and `TabNavItemDef`. */
export interface TabCountProps {
  /** A count badge after the title. `undefined` shows no badge. */
  count?: number;
  /** The badge's colour. Colour alone carries no meaning: give `countLabel` too. */
  countVariant?: TabCountVariant;
  /**
   * What the count is, for a screen reader: "3 errors". Read after the title
   * ("Check, 3 errors") in place of the bare number, which is then hidden from
   * assistive technology.
   */
  countLabel?: string;
}

/**
 * A coloured count's text takes the darker step of its ramp: the badge's own
 * `*-600` text is under 4.5:1 for this text size.
 */
const STRONG_TEXT: Record<Exclude<TabCountVariant, 'neutral'>, string> = {
  info: 'text-blue-700 dark:text-blue-300',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
};

const BADGE_VARIANT: Record<TabCountVariant, BadgeVariant> = {
  neutral: 'neutral',
  info: 'blue',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
};

/**
 * The count after a tab's title, in `Tabs` and `TabNav` alike. A neutral
 * count is in the primary colour on the active tab, gray on the rest; a
 * coloured one keeps its colour whatever the tab, since its colour says
 * something. The badge has the outline tone alone.
 */
export const TabCount = ({
  count,
  countVariant = 'neutral',
  countLabel,
  loading,
  active = false,
}: TabCountProps & { loading?: boolean; active?: boolean }) => {
  if (!loading && count === undefined) return null;
  const neutral = countVariant === 'neutral';
  return (
    <>
      {countLabel && !loading ? (
        <span className="sr-only">, {countLabel}</span>
      ) : null}
      <Badge
        variant={neutral && active ? 'primary' : BADGE_VARIANT[countVariant]}
        shape="pill"
        tone="outline"
        className={cn(
          // The badge is 24px, taller than the 20px title line: the negative
          // margin keeps it from raising a counted tab above its neighbours.
          'ms-1.5 -my-[2px]',
          !neutral && STRONG_TEXT[countVariant],
        )}
        data-count-variant={countVariant}
        aria-hidden={countLabel && !loading ? true : undefined}
      >
        {loading ? <LoadingSpinner size={12} /> : count}
      </Badge>
    </>
  );
};
