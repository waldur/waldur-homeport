import classNames from 'classnames';

const PINNED_SHADOW_BASE =
  "before:content-[''] before:pointer-events-none before:absolute before:top-0 before:block before:w-[5px] before:h-full";

const PINNED_SHADOW_END =
  'before:right-0 before:bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--shadow-color)_10%,transparent))]';

const PINNED_SHADOW_START =
  'before:left-0 before:bg-[linear-gradient(-90deg,transparent,color-mix(in_srgb,var(--shadow-color)_10%,transparent))]';

const PINNED_SHADOW_FLOATING_ACTIONS =
  'before:left-0 before:-ml-[5px] before:bg-[linear-gradient(-90deg,color-mix(in_srgb,var(--shadow-color)_10%,transparent),transparent)]';

/**
 * Sticky positioning and 5px gradient edge strip for pinned header/body cells.
 * Reads `--table-row-bg` from the owning `<tr>` so header, body, expanded,
 * selected, and nested rows all share one background definition.
 */
export function getPinnedCellClasses(
  pinned?: boolean,
  shadow?: boolean | 'start' | 'end',
): string {
  if (!pinned) return '';
  return classNames(
    'sticky z-[2] bg-[var(--table-row-bg)]',
    (shadow === 'end' || shadow === 'start') && PINNED_SHADOW_BASE,
    shadow === 'end' && PINNED_SHADOW_END,
    shadow === 'start' && PINNED_SHADOW_START,
  );
}

/**
 * Sticky positioning and outside-left 5px gradient strip for the right-pinned
 * actions column (`th[data-slot="header-actions"]` and `td[data-slot="row-actions"]`).
 */
export function getPinnedActionsClasses(
  isPinned: boolean,
  isFloating: boolean,
): string {
  if (!isPinned) return '';
  return classNames(
    'sticky right-0 z-[2] bg-[var(--table-row-bg)]',
    isFloating && PINNED_SHADOW_BASE,
    isFloating && PINNED_SHADOW_FLOATING_ACTIONS,
  );
}

/**
 * Shared 24x24px WCAG 2.2 AA target and negative margin compensation for
 * header controls (sort toggle, column filter toggle, pin toggle).
 */
export const HEADER_CONTROL_BTN_CLASS =
  'text-btn min-w-[24px] min-h-[24px] justify-center -my-1 -mr-1 ml-0 [&_svg]:text-quinary hover:[&_svg]:text-quaternary';

/**
 * Hover elevation on table rows (`TableContent` when `hoverShadow` is enabled).
 */
export const TABLE_HOVER_SHADOW_CLASS = [
  '[&>table>tbody>tr[data-slot=table-row]:hover]:border-y',
  '[&>table>tbody>tr[data-slot=table-row]:hover]:border-solid',
  '[&>table>tbody>tr[data-slot=table-row]:hover]:border-secondary',
  '[&>table>tbody>tr[data-slot=table-row]:hover]:rounded-lg',
  '[&>table>tbody>tr[data-slot=table-row]:hover]:shadow-[0_1.3px_13px_3.25px_color-mix(in_srgb,var(--shadow-color)_5%,transparent)]',
  'dark:[&>table>tbody>tr[data-slot=table-row]:hover]:shadow-[0_1.3px_13px_3.25px_color-mix(in_srgb,var(--fg-white)_5%,transparent)]',
  // Rows paint their own background, so the hovered row is raised for its
  // shadow to show over its neighbours.
  '[&>table>tbody>tr[data-slot=table-row]:hover]:z-[1]',
  '[&>table>tbody>tr[data-slot=table-row]:hover]:transition-all',
  '[&>table>tbody>tr[data-slot=table-row]:hover]:duration-200',
].join(' ');

/**
 * Hover elevation on grid cards (`TableContent` in grid mode when `hoverShadow` is enabled).
 */
export const GRID_HOVER_SHADOW_CLASS = [
  '[&_[data-slot=card]:not([data-variant=table]):hover]:[--card-box-shadow:0_1.3px_13px_3.25px_color-mix(in_srgb,var(--shadow-color)_5%,transparent)]',
  'dark:[&_[data-slot=card]:not([data-variant=table]):hover]:[--card-box-shadow:0_1.3px_13px_3.25px_color-mix(in_srgb,var(--fg-white)_5%,transparent)]',
  '[&_[data-slot=card]:not([data-variant=table]):hover]:transition-all',
  '[&_[data-slot=card]:not([data-variant=table]):hover]:duration-200',
].join(' ');
