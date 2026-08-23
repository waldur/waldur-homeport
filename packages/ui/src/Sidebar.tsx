import { SidebarSimpleIcon } from '@phosphor-icons/react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  ComponentProps,
  createContext,
  CSSProperties,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { cn } from './cn';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './Sheet';
import { Tooltip } from './Tooltip';
import { useIsMobile } from './useIsMobile';

/**
 * shadcn's actual Sidebar recipe (SidebarProvider/useSidebar context,
 * collapsible desktop sidebar with an "icon" rail mode, a Sheet-based
 * mobile drawer, Cmd/Ctrl+B keyboard shortcut, state persisted via a
 * cookie — see https://ui.shadcn.com/docs/components/sidebar) — colors
 * point at waldur-design-tokens/surfaceColors.css tokens instead of
 * shadcn's own --sidebar-* CSS variables. One adaptation from the
 * original: that recipe reads the persisted cookie server-side (a Next.js
 * layout) and passes it in as `defaultOpen` — there's no server here, so
 * SidebarProvider reads document.cookie directly on first render instead.
 *
 * Deliberately omitted (nothing here needs them yet): SidebarInput,
 * SidebarGroupAction, SidebarMenuAction, SidebarMenuSkeleton, and the
 * SidebarMenuSub* nested-submenu family. Add them, following the same
 * upstream recipe, if a real consumer needs them rather than guessing the
 * shape upfront.
 *
 * SidebarModeCard/SidebarNavItem/SidebarSection below are this app's own
 * convenience layer on top of the primitives above (no shadcn equivalent
 * for SidebarModeCard specifically) — their public API is unchanged from
 * before this migration, so OrgDashboardMock.tsx didn't need to change
 * except for adding the now-required SidebarProvider wrapper.
 */

const SIDEBAR_COOKIE_NAME = 'sidebar_state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = '16rem';
const SIDEBAR_WIDTH_MOBILE = '18rem';
const SIDEBAR_WIDTH_ICON = '3rem';
const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

function readSidebarCookie(defaultOpen: boolean): boolean {
  if (typeof document === 'undefined') {
    return defaultOpen;
  }
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${SIDEBAR_COOKIE_NAME}=`));
  if (!match) {
    return defaultOpen;
  }
  return match.split('=')[1] === 'true';
}

interface SidebarContextProps {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextProps | null>(null);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }
  return context;
}

export interface SidebarProviderProps extends ComponentProps<'div'> {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: SidebarProviderProps) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = useState(false);
  const [openState, setOpenState] = useState(() =>
    readSidebarCookie(defaultOpen),
  );
  const open = openProp ?? openState;

  const setOpen = useCallback(
    (value: boolean | ((current: boolean) => boolean)) => {
      const next = typeof value === 'function' ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(next);
      } else {
        setOpenState(next);
      }
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${next}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [open, setOpenProp],
  );

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setOpenMobile((value) => !value);
    } else {
      setOpen((value) => !value);
    }
  }, [isMobile, setOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  const state: 'expanded' | 'collapsed' = open ? 'expanded' : 'collapsed';

  const contextValue = useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        style={
          {
            '--sidebar-width': SIDEBAR_WIDTH,
            '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
            ...style,
          } as CSSProperties
        }
        className={cn('flex min-h-svh w-full', className)}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export interface SidebarRootProps extends ComponentProps<'div'> {
  side?: 'left' | 'right';
  collapsible?: 'offcanvas' | 'icon' | 'none';
}

export function Sidebar({
  side = 'left',
  collapsible = 'icon',
  className,
  children,
  ...props
}: SidebarRootProps) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  if (collapsible === 'none') {
    return (
      <div
        className={cn(
          'flex h-full w-(--sidebar-width) flex-col border-[var(--surface-sidebar-border)] bg-[var(--surface-sidebar-bg)]',
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
      {/* Layout spacer — pushes the flex sibling (the real content) over by
          the sidebar's current width, transitioning smoothly on collapse. */}
      <div
        className={cn(
          'relative h-svh w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear',
          'group-data-[collapsible=offcanvas]:w-0',
          'group-data-[collapsible=icon]:w-(--sidebar-width-icon)',
        )}
      />
      <div
        className={cn(
          'fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex',
          side === 'left'
            ? 'left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]'
            : 'right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
          collapsible === 'icon' &&
            'group-data-[collapsible=icon]:w-(--sidebar-width-icon)',
          side === 'left'
            ? 'border-r border-[var(--surface-sidebar-border)]'
            : 'border-l border-[var(--surface-sidebar-border)]',
          className,
        )}
        {...props}
      >
        <div className="flex h-full w-full flex-col bg-[var(--surface-sidebar-bg)]">
          {children}
        </div>
      </div>
    </div>
  );
}

export function SidebarTrigger({
  className,
  onClick,
  ...props
}: ComponentProps<'button'>) {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      type="button"
      aria-label="Toggle sidebar"
      className={cn(
        'flex size-9 items-center justify-center rounded-lg text-[var(--surface-text-secondary)] hover:bg-[var(--nav-item-hover-bg)]',
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <SidebarSimpleIcon size={18} weight="bold" />
    </button>
  );
}

export function SidebarInset({ className, ...props }: ComponentProps<'main'>) {
  return (
    <main
      // min-w-0: this is a flex-1 item in SidebarProvider's row-direction
      // flex container (alongside the fixed-width sidebar); without it,
      // its default min-width:auto refuses to shrink below its content's
      // own natural width, forcing the whole page to overflow horizontally
      // rather than letting this area's content wrap/shrink to whatever
      // space the sidebar actually left it — same flex pitfall as
      // TopBar.tsx's left/center slots.
      className={cn('relative flex w-full min-w-0 flex-1 flex-col', className)}
      {...props}
    />
  );
}

export function SidebarHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-col gap-2 p-4', className)}
      data-sidebar="header"
      {...props}
    />
  );
}

export function SidebarFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-col gap-2 p-4', className)}
      data-sidebar="footer"
      {...props}
    />
  );
}

export function SidebarSeparator({
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      role="separator"
      className={cn('mx-4 h-px bg-[var(--surface-sidebar-border)]', className)}
      {...props}
    />
  );
}

export function SidebarContent({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex min-h-0 flex-1 flex-col gap-4 overflow-auto p-4 group-data-[collapsible=icon]:overflow-hidden',
        className,
      )}
      {...props}
    />
  );
}

export function SidebarGroup({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('relative flex w-full min-w-0 flex-col gap-0.5', className)}
      {...props}
    />
  );
}

export function SidebarGroupLabel({
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'px-3 pt-3 pb-1 text-xs font-medium tracking-wide text-[var(--nav-section-label)] transition-opacity duration-200',
        'group-data-[collapsible=icon]:opacity-0',
        className,
      )}
      {...props}
    />
  );
}

export function SidebarGroupContent(props: ComponentProps<'div'>) {
  return <div className="flex flex-col gap-0.5" {...props} />;
}

export function SidebarMenu({ className, ...props }: ComponentProps<'ul'>) {
  return (
    <ul
      className={cn('flex w-full min-w-0 flex-col gap-0.5', className)}
      {...props}
    />
  );
}

export function SidebarMenuItem({ className, ...props }: ComponentProps<'li'>) {
  return <li className={cn('relative', className)} {...props} />;
}

const sidebarMenuButtonVariants = cva(
  'flex w-full items-center gap-2.5 overflow-hidden rounded-lg p-2 text-left text-sm font-medium transition-colors group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0',
  {
    variants: {
      active: {
        true: 'bg-[var(--nav-item-active-bg)] text-[var(--nav-item-active-text)]',
        false:
          'text-[var(--nav-item-text)] hover:bg-[var(--nav-item-hover-bg)]',
      },
    },
    defaultVariants: {
      active: false,
    },
  },
);

export interface SidebarMenuButtonProps
  extends
    ComponentProps<'button'>,
    VariantProps<typeof sidebarMenuButtonVariants> {
  asChild?: boolean;
  tooltip?: string;
}

export function SidebarMenuButton({
  asChild = false,
  active,
  tooltip,
  className,
  ...props
}: SidebarMenuButtonProps) {
  const { state, isMobile } = useSidebar();
  const Comp = asChild ? Slot : 'button';

  const button = (
    <Comp
      data-active={active}
      className={cn(sidebarMenuButtonVariants({ active }), className)}
      {...props}
    />
  );

  if (!tooltip || state !== 'collapsed' || isMobile) {
    return button;
  }

  return (
    <Tooltip label={tooltip} side="right">
      {button}
    </Tooltip>
  );
}

export function SidebarMenuBadge({
  className,
  ...props
}: ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'text-xs text-[var(--surface-text-muted)] group-data-[collapsible=icon]:hidden',
        className,
      )}
      {...props}
    />
  );
}

// --- Convenience layer specific to this dashboard's mockup, built on the
// primitives above. Public API unchanged from before this migration. ---

export interface SidebarNavItemProps {
  icon?: ReactNode;
  label: string;
  active?: boolean;
  count?: ReactNode;
  onClick?: () => void;
  href?: string;
}

export const SidebarNavItem = ({
  icon,
  label,
  active,
  count,
  onClick,
  href,
}: SidebarNavItemProps) => (
  <SidebarMenuItem>
    <SidebarMenuButton
      asChild={!!href}
      active={active}
      tooltip={label}
      onClick={onClick}
      type={href ? undefined : 'button'}
    >
      {href ? (
        <a href={href}>
          <SidebarNavItemContent icon={icon} label={label} count={count} />
        </a>
      ) : (
        <SidebarNavItemContent icon={icon} label={label} count={count} />
      )}
    </SidebarMenuButton>
  </SidebarMenuItem>
);

const SidebarNavItemContent = ({
  icon,
  label,
  count,
}: Pick<SidebarNavItemProps, 'icon' | 'label' | 'count'>) => (
  <>
    {icon && (
      <span className="flex size-4 shrink-0 items-center justify-center">
        {icon}
      </span>
    )}
    <span className="flex-1 group-data-[collapsible=icon]:hidden">{label}</span>
    {count != null && <SidebarMenuBadge>{count}</SidebarMenuBadge>}
  </>
);

export interface SidebarSectionProps {
  label?: string;
  children: ReactNode;
}

export const SidebarSection = ({ label, children }: SidebarSectionProps) => (
  <SidebarGroup>
    {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
    <SidebarGroupContent>
      <SidebarMenu>{children}</SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
);

export interface SidebarModeCardProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  onClick?: () => void;
}

export const SidebarModeCard = ({
  icon,
  title,
  subtitle,
  eyebrow,
  onClick,
}: SidebarModeCardProps) => (
  <div className="flex flex-col gap-1.5">
    {eyebrow && (
      <div className="px-1 text-xs font-medium tracking-wide text-[var(--nav-section-label)] group-data-[collapsible=icon]:hidden">
        {eyebrow}
      </div>
    )}
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg border border-[var(--surface-card-border)] bg-[var(--surface-hover-bg)] p-3 text-left group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0"
    >
      {icon && (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[var(--nav-item-active-bg)] text-[var(--nav-item-active-text)]">
          {icon}
        </span>
      )}
      <span className="flex flex-col group-data-[collapsible=icon]:hidden">
        <span className="text-sm font-semibold text-[var(--surface-text-primary)]">
          {title}
        </span>
        {subtitle && (
          <span className="text-xs text-[var(--surface-text-muted)]">
            {subtitle}
          </span>
        )}
      </span>
    </button>
  </div>
);
