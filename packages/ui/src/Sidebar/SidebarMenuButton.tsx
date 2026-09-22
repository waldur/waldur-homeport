import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { ComponentProps } from 'react';

import { cn } from '../cn';
import { Tooltip } from '../Tooltip';

import { useSidebar, useSidebarSubDepth } from './context';

/**
 * Style variants for sidebar menu buttons, handling dimensions, active backgrounds,
 * hover states, and collapsed icon rail adjustments.
 */
export const sidebarMenuButtonVariants = cva(
  'flex h-10 w-full items-center gap-3 overflow-hidden rounded-md px-[12px] py-[7px] text-left text-sm font-medium text-[var(--nav-item-text)] transition-colors group-data-[collapsible=icon]/panel:size-9 group-data-[collapsible=icon]/panel:justify-center group-data-[collapsible=icon]/panel:p-0',
  {
    variants: {
      active: {
        true: 'bg-[var(--nav-item-active-bg)]',
        false: 'hover:bg-[var(--nav-item-hover-bg)]',
      },
    },
    defaultVariants: {
      active: false,
    },
  },
);

/**
 * Props for the `SidebarMenuButton` component.
 */
export interface SidebarMenuButtonProps
  extends
    ComponentProps<'button'>,
    VariantProps<typeof sidebarMenuButtonVariants> {
  /** When true, delegates rendering and ref to its child element (via Radix Slot). */
  asChild?: boolean;
  /**
   * Tooltip label displayed when the sidebar is collapsed in icon rail mode.
   * Suppressed when expanded or hover-expanded.
   */
  tooltip?: string;
  /**
   * Explanatory tooltip displayed unconditionally when `disabled` is true.
   */
  disabledTooltip?: string;
}

/**
 * Interactive button primitive for sidebar menu rows.
 * Handles active highlights, nested depth indentation, and collapsed/disabled tooltips.
 */
export function SidebarMenuButton({
  asChild = false,
  active,
  tooltip,
  disabled,
  disabledTooltip,
  className,
  style,
  ...props
}: SidebarMenuButtonProps) {
  const { state, isMobile, isHoverExpanded } = useSidebar();
  const depth = useSidebarSubDepth();
  const isSub = depth > 0;
  const Comp = asChild ? Slot : 'button';
  // Add incremental left padding for nested menu levels beyond the first level
  const extraIndentPx = isSub ? Math.max(depth - 1, 0) * 9.75 : 0;

  const button = (
    <Comp
      data-active={active}
      disabled={disabled}
      aria-label={tooltip}
      className={cn(
        sidebarMenuButtonVariants({ active }),
        isSub && 'rounded-none',
        disabled && 'pointer-events-none cursor-not-allowed opacity-50',
        className,
      )}
      style={
        extraIndentPx ? { paddingLeft: 12 + extraIndentPx, ...style } : style
      }
      {...props}
    />
  );

  if (disabled && disabledTooltip) {
    return (
      <Tooltip
        label={disabledTooltip}
        side={
          state === 'collapsed' && !isMobile && !isHoverExpanded
            ? 'right'
            : undefined
        }
      >
        <span
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
          className={cn(
            'flex w-full cursor-not-allowed rounded-md focus-visible:outline-none group-data-[collapsible=icon]/panel:w-auto group-data-[collapsible=icon]/panel:justify-center',
            isSub && 'rounded-none',
          )}
        >
          {button}
        </span>
      </Tooltip>
    );
  }

  if (!tooltip || state !== 'collapsed' || isMobile || isHoverExpanded) {
    return button;
  }

  return (
    <Tooltip label={tooltip} side="right">
      {button}
    </Tooltip>
  );
}

/**
 * Pill badge displaying item counts or status indicators in menu rows.
 * Uses themed border and text tokens, and hides in collapsed icon rail mode.
 */
export function SidebarMenuBadge({
  className,
  ...props
}: ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'inline-flex min-w-6 items-center justify-center rounded-full border-[1px] border-solid border-[color:var(--nav-badge-border)] bg-transparent px-[9px] py-[1px] text-sm text-[var(--nav-badge-text)] group-data-[collapsible=icon]/panel:hidden',
        className,
      )}
      {...props}
    />
  );
}
