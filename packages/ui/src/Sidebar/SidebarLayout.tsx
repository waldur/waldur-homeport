import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { ComponentProps, ComponentPropsWithoutRef, forwardRef } from 'react';

import { cn } from '../cn';

/**
 * Standard slot padding: 16px on full-width view, reduced to 6px in collapsed
 * icon rail mode so buttons center cleanly within the rail.
 */
const SIDEBAR_SLOT_PADDING = 'p-4 group-data-[collapsible=icon]/panel:px-1.5!';

/**
 * Pinned header container at the top of the sidebar.
 */
export function SidebarHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-col gap-2', SIDEBAR_SLOT_PADDING, className)}
      data-sidebar="header"
      {...props}
    />
  );
}

/**
 * Pinned footer container at the bottom of the sidebar.
 */
export function SidebarFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-col gap-2', SIDEBAR_SLOT_PADDING, className)}
      data-sidebar="footer"
      {...props}
    />
  );
}

/**
 * Horizontal rule dividing major sidebar sections.
 */
export function SidebarSeparator({
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      role="separator"
      className={cn('mx-4 h-px bg-[color:var(--nav-separator)]', className)}
      {...props}
    />
  );
}

/**
 * Props for the `SidebarContent` scrollable container.
 */
export interface SidebarContentProps extends ComponentPropsWithoutRef<
  typeof ScrollAreaPrimitive.Root
> {}

/**
 * Scrollable central area of the sidebar backed by a custom Radix ScrollArea.
 * The custom scrollbar is themed via design tokens and hidden in collapsed icon rail mode.
 */
export const SidebarContent = forwardRef<HTMLDivElement, SidebarContentProps>(
  function SidebarContent(
    { className, children, type = 'hover', ...props },
    ref,
  ) {
    return (
      <ScrollAreaPrimitive.Root
        ref={ref}
        type={type}
        className={cn(
          'aside-scroll-area relative min-h-0 flex-1 overflow-hidden',
          'group-data-[collapsible=icon]/panel:overflow-hidden',
          className,
        )}
        data-sidebar="content"
        {...props}
      >
        <ScrollAreaPrimitive.Viewport
          className="h-full w-full rounded-[inherit] [&>div]:block! [&>div]:w-full!"
          id="kt_aside_menu_wrapper"
          data-sidebar="content-viewport"
          data-testid="aside-menu-wrapper"
        >
          <div className={cn('flex flex-col gap-4', SIDEBAR_SLOT_PADDING)}>
            {children}
          </div>
        </ScrollAreaPrimitive.Viewport>
        <ScrollAreaPrimitive.Scrollbar
          orientation="vertical"
          data-testid="aside-scroll-scrollbar"
          className={cn(
            'aside-scroll-scrollbar z-10 flex w-2 touch-none select-none p-0.5 transition-opacity duration-150',
            'data-[state=hidden]:opacity-0 data-[state=visible]:opacity-100',
            'group-data-[collapsible=icon]/panel:hidden',
          )}
        >
          <ScrollAreaPrimitive.Thumb
            data-testid="aside-scroll-thumb"
            className="aside-scroll-thumb relative flex-1 rounded-full bg-[var(--nav-scrollbar-color,var(--color-gray-500))] transition-colors duration-150 hover:bg-[var(--nav-scrollbar-hover-color,var(--color-gray-400))]"
          />
        </ScrollAreaPrimitive.Scrollbar>
        <ScrollAreaPrimitive.Corner />
      </ScrollAreaPrimitive.Root>
    );
  },
);
SidebarContent.displayName = 'SidebarContent';

/**
 * Container grouping related menu items together with optional label.
 */
export function SidebarGroup({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('relative flex w-full min-w-0 flex-col gap-1', className)}
      {...props}
    />
  );
}

/**
 * Section label rendered above a `SidebarGroup`. Fades out in collapsed icon rail mode.
 */
export function SidebarGroupLabel({
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'px-3 pt-3 pb-1 text-xs font-medium tracking-wide text-[var(--nav-section-label)] transition-opacity duration-200',
        'group-data-[collapsible=icon]/panel:opacity-0',
        className,
      )}
      {...props}
    />
  );
}

/**
 * Content container inside a `SidebarGroup`.
 */
export function SidebarGroupContent(props: ComponentProps<'div'>) {
  return <div className="flex flex-col gap-1" {...props} />;
}

/**
 * Unordered list container (`<ul>`) for sidebar menu items.
 * Centers items when collapsed to icon rail mode.
 */
export function SidebarMenu({ className, ...props }: ComponentProps<'ul'>) {
  return (
    <ul
      className={cn(
        'list-none m-0 p-0 flex w-full min-w-0 flex-col gap-1 group-data-[collapsible=icon]/panel:items-center',
        className,
      )}
      {...props}
    />
  );
}

/**
 * List item (`<li>`) representing an entry in a `SidebarMenu`.
 */
export const SidebarMenuItem = forwardRef<HTMLLIElement, ComponentProps<'li'>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn('relative', className)} {...props} />
  ),
);
SidebarMenuItem.displayName = 'SidebarMenuItem';
