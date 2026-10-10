import { buttonVariants, type ButtonSize } from './BaseButton';
import { cn } from './cn';

/**
 * `neutral`: white segments, the selected one in the tertiary pressed gray —
 * for a lens in ordinary chrome (a table toolbar, a form). `brand`: light brand
 * tint segments, the selected one solid brand — for a switcher that is the
 * page's main control, e.g. a chart toolbar, where the choice should read at a
 * glance. The two mirror the tertiary and secondary/primary button variants.
 */
export type SegmentedVariant = 'neutral' | 'brand';

// Full literal strings, not built from a size: Tailwind only generates a class
// it can read verbatim in a scanned file (dynamic string interpolation is not
// scanned by Tailwind v4). Radius follows the size, as it does on BaseButton.
// Record<ButtonSize, …>, so a new button size cannot be added without a radius here.
const EDGE_RADIUS: Record<ButtonSize, string> = {
  sm: 'first:rounded-l-md last:rounded-r-md',
  md: 'first:rounded-l-lg last:rounded-r-lg',
  lg: 'first:rounded-l-lg last:rounded-r-lg',
};

// Selected fill per variant and per primitive (RadioGroup `checked`, Tabs
// `aria-selected`), each spelled out in full — see the note on EDGE_RADIUS.
// Tabs key off `aria-selected`, not `data-state="active"`: a Tooltip around a
// tab overwrites `data-state` with its own.
const SELECTED = {
  neutral: [
    'data-[state=checked]:bg-[var(--btn-tertiary-bg-pressed)] data-[state=checked]:hover:bg-[var(--btn-tertiary-bg-pressed)] data-[state=checked]:focus-visible:bg-[var(--btn-tertiary-bg-pressed)]',
    'aria-selected:bg-[var(--btn-tertiary-bg-pressed)] aria-selected:hover:bg-[var(--btn-tertiary-bg-pressed)] aria-selected:focus-visible:bg-[var(--btn-tertiary-bg-pressed)]',
  ],
  brand: [
    'data-[state=checked]:bg-[var(--btn-primary-bg)] data-[state=checked]:text-[var(--btn-primary-text)] data-[state=checked]:hover:bg-[var(--btn-primary-bg-hover)] data-[state=checked]:focus-visible:bg-[var(--btn-primary-bg-hover)] data-[state=checked]:active:bg-[var(--btn-primary-bg-pressed)] data-[state=checked]:shadow-[inset_0_0_0_1px_transparent]',
    'aria-selected:bg-[var(--btn-primary-bg)] aria-selected:text-[var(--btn-primary-text)] aria-selected:hover:bg-[var(--btn-primary-bg-hover)] aria-selected:focus-visible:bg-[var(--btn-primary-bg-hover)] aria-selected:active:bg-[var(--btn-primary-bg-pressed)] aria-selected:shadow-[inset_0_0_0_1px_transparent]',
  ],
} as const;

/**
 * The container of a joined row of segments.
 *
 * self-center: the row's height is its `size`, nothing else. Left to flexbox's
 * default `align-items: stretch`, a host row with a taller sibling (a table
 * toolbar next to its search box) would grow every segment to match, and the
 * same control would then measure differently depending on where it is mounted.
 */
export const segmentedListClassName = ({
  fullWidth,
  className,
}: { fullWidth?: boolean; className?: string } = {}) =>
  cn('inline-flex self-center', fullWidth && 'flex w-full', className);

/**
 * One segment: `buttonVariants({ variant: 'tertiary' })` joined to its
 * neighbours. Borders are inset shadows (see buttonVariants), so neighbours
 * overlap by 1px to render a single shared line, only the outer corners are
 * rounded, and the focused/selected segment is lifted above its neighbours so
 * its ring and border are not clipped. The selected one takes the variant's
 * selected fill (see SegmentedVariant).
 *
 * Shared by SegmentedControl (a Radix RadioGroup, selected =
 * `data-state="checked"`) and by Radix `Tabs.Trigger` (selected =
 * `data-state="active"`) for a switch that owns tab panels. Both selectors are
 * spelled out so either primitive works; the one it does not use never matches.
 */
export const segmentedItemClassName = ({
  size = 'md',
  variant = 'neutral',
  fullWidth,
  className,
}: {
  size?: ButtonSize;
  variant?: SegmentedVariant;
  fullWidth?: boolean;
  className?: string;
} = {}) =>
  cn(
    buttonVariants({
      variant: variant === 'brand' ? 'secondary' : 'tertiary',
      size,
    }),
    'relative -ml-px rounded-none first:ml-0',
    EDGE_RADIUS[size],
    fullWidth && 'flex-1',
    'focus-visible:z-[2] data-[state=checked]:z-[1] aria-selected:z-[1]',
    SELECTED[variant],
    className,
  );
