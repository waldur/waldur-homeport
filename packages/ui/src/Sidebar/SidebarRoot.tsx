import { SidebarSimpleIcon } from '@phosphor-icons/react';
import { ComponentProps, ReactNode } from 'react';

import { cn } from '../cn';
import { ICON_BUTTON_BASE_CLASSNAME } from '../iconButtonStyles';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../Sheet';

import { useSidebar } from './context';

/** Mobile drawer width for the Sheet modal. */
const SIDEBAR_WIDTH_MOBILE = '250px';

/**
 * Props for the `Sidebar` root component.
 */
export interface SidebarRootProps extends ComponentProps<'div'> {
  /** Anchor edge of the viewport ('left' | 'right'). @default 'left' */
  side?: 'left' | 'right';
  /** Collapse behavior on desktop ('icon' rail, 'offcanvas' slide-out, or 'none'). @default 'icon' */
  collapsible?: 'offcanvas' | 'icon' | 'none';
}

/**
 * Primary Sidebar component.
 * Renders a responsive mobile drawer (via Radix Sheet) on mobile screens,
 * or a fixed desktop panel paired with a layout spacer to avoid page reflow on hover-expansion.
 */
export function Sidebar({
  side = 'left',
  collapsible = 'icon',
  className,
  children,
  ...props
}: SidebarRootProps) {
  const {
    isMobile,
    state,
    openMobile,
    setOpenMobile,
    isHoverExpanded,
    setIsHoverExpanded,
  } = useSidebar();

  // On hover over a collapsed icon rail, temporarily expand the panel overlay
  // without changing layout spacer width, keeping adjacent page content from reflowing.
  const canHoverExpand =
    collapsible === 'icon' && state === 'collapsed' && !isMobile;
  const panelCollapsible =
    canHoverExpand && isHoverExpanded
      ? ''
      : state === 'collapsed'
        ? collapsible
        : '';

  if (collapsible === 'none') {
    return (
      <div
        className={cn(
          'flex h-full w-(--sidebar-width) flex-col border-[color:var(--surface-sidebar-border)] bg-[var(--surface-sidebar-bg)]',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          side={side}
          className="p-0"
          style={{ width: SIDEBAR_WIDTH_MOBILE }}
          showCloseButton={false}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className="group peer hidden md:block"
      data-state={state}
      data-collapsible={state === 'collapsed' ? collapsible : ''}
      data-side={side}
    >
      {/* Layout spacer reserving page flow width, transitioning smoothly between full and rail widths */}
      <div
        className={cn(
          'relative h-svh w-(--sidebar-width) bg-transparent transition-[width] duration-300 ease-[ease]',
          'group-data-[collapsible=offcanvas]:w-0',
          'group-data-[collapsible=icon]:w-(--sidebar-width-icon)!',
        )}
      />
      {/* Fixed sidebar panel overlay */}
      <div
        className={cn(
          'group/panel fixed inset-y-0 z-sidebar-panel hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-300 ease-[ease] md:flex',
          side === 'left'
            ? 'left-0 data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]'
            : 'right-0 data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
          collapsible === 'icon' &&
            'data-[collapsible=icon]:w-(--sidebar-width-icon)!',
          side === 'left'
            ? 'border-r border-[color:var(--surface-sidebar-border)]'
            : 'border-l border-[color:var(--surface-sidebar-border)]',
          // Hover-expanded rail styling with subtle drop shadow
          canHoverExpand &&
            isHoverExpanded &&
            'md:w-(--sidebar-width) md:shadow-[5px_0px_10px_rgba(70,78,95,0.075)]',
          className,
        )}
        data-collapsible={panelCollapsible}
        onMouseEnter={() => {
          if (canHoverExpand) setIsHoverExpanded(true);
        }}
        onMouseLeave={() => setIsHoverExpanded(false)}
        {...props}
      >
        <div className="flex h-full w-full flex-col bg-[var(--surface-sidebar-bg)]">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Props for the `SidebarTrigger` button.
 */
export interface SidebarTriggerProps extends ComponentProps<'button'> {
  /** Custom icon glyph. Defaults to Phosphor's `SidebarSimpleIcon`. */
  icon?: ReactNode;
}

/**
 * Accessible button toggle that opens/closes the sidebar.
 */
export function SidebarTrigger({
  className,
  icon,
  onClick,
  ...props
}: SidebarTriggerProps) {
  const { toggleSidebar, state } = useSidebar();
  return (
    <button
      type="button"
      aria-label="Toggle sidebar"
      aria-pressed={state === 'collapsed'}
      className={cn(ICON_BUTTON_BASE_CLASSNAME, className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      {icon ?? <SidebarSimpleIcon size={18} weight="bold" />}
    </button>
  );
}

/**
 * Main content container rendered alongside the Sidebar in a row flex layout.
 * Enforces `min-w-0 flex-1` to prevent flex children from causing horizontal document overflow.
 */
export function SidebarInset({ className, ...props }: ComponentProps<'main'>) {
  return (
    <main
      className={cn('relative flex w-full min-w-0 flex-1 flex-col', className)}
      {...props}
    />
  );
}
