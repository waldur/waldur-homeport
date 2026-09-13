import { CaretDownIcon } from '@phosphor-icons/react';
import * as Collapsible from '@radix-ui/react-collapsible';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  ComponentProps,
  CSSProperties,
  forwardRef,
  ReactNode,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { cn } from '../cn';
import { Tooltip } from '../Tooltip';

import { SidebarContext, SidebarMenuSubDepthContext } from './context';
import { SidebarMenuItem } from './SidebarLayout';
import { sidebarMenuButtonVariants } from './SidebarMenuButton';

/**
 * Nested unordered list container for submenu and accordion children.
 * Increments `SidebarMenuSubDepthContext` and provides depth-aware active background tokens.
 */
export const SidebarMenuSub = forwardRef<
  HTMLUListElement,
  ComponentProps<'ul'>
>(({ className, style, children, ...props }, ref) => {
  const depth = useContext(SidebarMenuSubDepthContext);
  const nextDepth = depth + 1;
  const subitemActiveBg =
    depth === 0 ? 'var(--nav-item-subitem-bg)' : 'var(--nav-item-subitem2-bg)';

  return (
    <SidebarMenuSubDepthContext.Provider value={nextDepth}>
      <ul
        ref={ref}
        style={
          {
            '--nav-item-active-bg': subitemActiveBg,
            '--nav-accordion-active': 'var(--nav-sub-accordion-active)',
            ...style,
          } as CSSProperties
        }
        className={cn(
          'list-none m-0 flex min-w-0 flex-col pl-0',
          'group-data-[collapsible=icon]/panel:hidden',
          className,
        )}
        {...props}
      >
        {children}
      </ul>
    </SidebarMenuSubDepthContext.Provider>
  );
});
SidebarMenuSub.displayName = 'SidebarMenuSub';

/**
 * List item inside a `SidebarMenuSub`.
 */
export function SidebarMenuSubItem({
  className,
  ...props
}: ComponentProps<'li'>) {
  return <li className={cn('relative', className)} {...props} />;
}

const sidebarMenuSubButtonVariants = cva(
  'flex h-10 w-full items-center gap-3 overflow-hidden rounded-none pl-11 pr-[12px] py-[7px] text-left text-sm font-medium text-[var(--nav-item-text)] transition-colors',
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
 * Props for `SidebarMenuSubButton`.
 */
export interface SidebarMenuSubButtonProps
  extends
    ComponentProps<'button'>,
    VariantProps<typeof sidebarMenuSubButtonVariants> {
  /** When true, delegates rendering and ref to its child element (via Radix Slot). */
  asChild?: boolean;
}

/**
 * Interactive button styled specifically for nested submenu items with fixed left indentation.
 */
export function SidebarMenuSubButton({
  asChild = false,
  active,
  className,
  ...props
}: SidebarMenuSubButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      data-active={active}
      className={cn(sidebarMenuSubButtonVariants({ active }), className)}
      {...props}
    />
  );
}

/**
 * Full-bleed list separator for dividing groups within a menu or submenu list.
 */
export function SidebarMenuSeparator({
  className,
  ...props
}: ComponentProps<'li'>) {
  return (
    <li
      role="separator"
      className={cn('my-2 h-px bg-[var(--nav-separator)]', className)}
      {...props}
    />
  );
}

/**
 * Props for the `SidebarMenuAccordion` collapsible item.
 */
export interface SidebarMenuAccordionProps {
  /** Optional ID for testing or external targeting. */
  id?: string;
  /** Leading icon node. */
  icon?: ReactNode;
  /** Header title text or element. */
  title: ReactNode;
  /** Trailing badge or interactive widget rendered before the accordion caret. */
  badge?: ReactNode;
  /** Whether the accordion header is disabled. */
  disabled?: boolean;
  /** Explanatory tooltip shown when `disabled` is true. */
  disabledTooltip?: string;
  /** Controlled open state. */
  open?: boolean;
  /** Callback fired when the open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Nested menu items rendered inside the collapsible body. */
  children: ReactNode;
}

/**
 * Collapsible menu item composed of an interactive header row and an animated submenu body.
 * Measures content height via `ResizeObserver` to drive smooth CSS slide animations.
 */
export function SidebarMenuAccordion({
  id,
  icon,
  title,
  badge,
  disabled = false,
  disabledTooltip,
  open,
  onOpenChange,
  children,
}: SidebarMenuAccordionProps) {
  const sidebar = useContext(SidebarContext);
  const depth = useContext(SidebarMenuSubDepthContext);
  const isSub = depth > 0;
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>();
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useLayoutEffect(() => {
    const node = contentRef.current;
    if (!node) return;
    setContentHeight(node.scrollHeight);
    resizeObserverRef.current ??= new ResizeObserver(() => {
      if (contentRef.current) {
        setContentHeight(contentRef.current.scrollHeight);
      }
    });
    const observer = resizeObserverRef.current;
    observer.observe(node);
    return () => observer.unobserve(node);
  }, [open]);

  // Incremental left padding step per nesting level
  const extraIndentPx = isSub ? Math.max(depth - 1, 0) * 9.75 : 0;

  const headerContent = (
    <>
      {icon ? (
        <span className="flex size-5 shrink-0 items-center justify-center text-[20px] text-[var(--nav-item-icon)] [&_svg]:size-5">
          {icon}
        </span>
      ) : isSub ? (
        <span
          data-testid="submenu-bullet-spacer"
          className="size-5 shrink-0"
          aria-hidden="true"
        />
      ) : null}
      <span className="flex-1 truncate group-data-[collapsible=icon]/panel:hidden">
        {title}
      </span>
      {badge != null && (
        <span className="group-data-[collapsible=icon]/panel:hidden">
          {badge}
        </span>
      )}
      {!disabled && (
        <CaretDownIcon
          size={17}
          weight="bold"
          className="shrink-0 text-[var(--nav-item-icon)] transition-transform duration-200 group-data-[state=open]:rotate-180 group-data-[collapsible=icon]/panel:hidden"
        />
      )}
    </>
  );

  if (disabled) {
    const headerRow = (
      <div
        className={cn(
          sidebarMenuButtonVariants({ active: false }),
          'pointer-events-none cursor-not-allowed opacity-50',
          isSub && 'rounded-none',
        )}
        style={extraIndentPx ? { paddingLeft: 12 + extraIndentPx } : undefined}
      >
        {headerContent}
      </div>
    );

    return (
      <SidebarMenuItem id={id}>
        {disabledTooltip ? (
          <Tooltip
            label={disabledTooltip}
            side={
              sidebar?.state === 'collapsed' &&
              !sidebar.isMobile &&
              !sidebar.isHoverExpanded
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
              {headerRow}
            </span>
          </Tooltip>
        ) : (
          headerRow
        )}
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible.Root asChild open={open} onOpenChange={onOpenChange}>
      <SidebarMenuItem
        id={id}
        className={cn(
          'transition-colors data-[state=open]:bg-[var(--nav-accordion-active)]',
          isSub
            ? 'data-[state=open]:rounded-none'
            : 'data-[state=open]:overflow-hidden data-[state=open]:rounded-lg',
        )}
      >
        <Collapsible.Trigger
          className={cn(
            sidebarMenuButtonVariants({ active: false }),
            'group',
            isSub && 'rounded-none',
          )}
          style={
            extraIndentPx ? { paddingLeft: 12 + extraIndentPx } : undefined
          }
        >
          {headerContent}
        </Collapsible.Trigger>
        <Collapsible.Content
          ref={contentRef}
          data-waldur-animated=""
          style={
            contentHeight !== undefined
              ? ({
                  '--sidebar-accordion-height': `${contentHeight}px`,
                } as CSSProperties)
              : undefined
          }
          className="flex! flex-col overflow-hidden data-[state=closed]:h-0 data-[state=closed]:animate-[waldur-sidebar-accordion-up_250ms_ease-out] data-[state=open]:animate-[waldur-sidebar-accordion-down_250ms_ease-out]"
        >
          <SidebarMenuSub>{children}</SidebarMenuSub>
        </Collapsible.Content>
      </SidebarMenuItem>
    </Collapsible.Root>
  );
}
