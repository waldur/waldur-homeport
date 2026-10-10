import { cn } from '../cn';

/**
 * The scroll frame of a tab strip. The active indicator overhangs the strip by
 * 1px (`-mb-px`) and any `overflow` container clips that, so the frame pads the
 * bottom by 1px to keep the underline whole. Baked into `TabsList` and
 * `TabNavList` (`scrollable`) so call sites cannot forget it.
 */
export const tabScrollClassName = (className?: string) =>
  cn('min-w-0 overflow-x-auto overflow-y-hidden pb-px', className);

export interface TabStyleProps {
  className?: string;
}

export const tabListVariants = ({
  bordered = true,
  className,
}: TabStyleProps & { bordered?: boolean } = {}) =>
  cn(
    'flex items-end gap-[1.23rem] border-b border-[var(--tabs-border)]',
    !bordered && 'border-b-0',
    className,
  );

// The selected tab is `aria-selected="true"` (`TabsTrigger`) or carries
// `aria-current` (`TabNavItem`). Not `data-state`: a `Tooltip` around the tab
// (its `tooltip` or `hint`) is a Radix trigger that overwrites `data-state`
// with its own `closed`/`delayed-open`. Hover only touches an inactive, enabled tab and uses neutral colours, so it
// never looks like the selected tab. Disabled keys off `aria-disabled`, which
// buttons and anchor (`asChild`) tabs both carry; `:disabled` misses anchors.
// The focus ring is inset on purpose: tab strips sit in scroll frames
// (`overflow-x-auto overflow-y-hidden`) that clip anything drawn outside the
// trigger, so an offset ring was cut off on the top and left.
// The explicit zero top and side borders matter for anchor tabs: a class such
// as Metronic's `.text-anchor` (`border: none`) resets every border width to
// `medium`, and `border-solid` then draws a box around the tab. Buttons never
// showed it because the Tailwind base layer zeroes their borders.
export const tabTriggerVariants = ({ className }: TabStyleProps = {}) =>
  cn(
    'relative z-[1] -mb-px inline-flex items-center justify-center border-b-2 border-solid border-b-transparent border-t-0 border-x-0 px-[4px] pt-[4px] pb-[10px] text-[1.077rem] leading-5 font-semibold text-[var(--tabs-text)] transition-colors cursor-pointer whitespace-nowrap',
    // Written out in full (no template string) so Tailwind's scanner sees it.
    '[&:not([aria-selected=true]):not([aria-current]):not([aria-disabled=true]):hover]:text-[var(--tabs-text-hover)] [&:not([aria-selected=true]):not([aria-current]):not([aria-disabled=true]):hover]:border-b-[var(--tabs-indicator-hover)]',
    'aria-selected:border-b-[var(--tabs-indicator)] aria-selected:text-[var(--tabs-text-active)] [&[aria-current]]:border-b-[var(--tabs-indicator)] [&[aria-current]]:text-[var(--tabs-text-active)]',
    'aria-disabled:text-[var(--tabs-text-disabled)] aria-disabled:border-b-transparent aria-disabled:cursor-not-allowed',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--focus-ring-color,var(--waldur-brand-600))] focus-visible:rounded-[var(--focus-ring-radius,6px)]',
    className,
  );
