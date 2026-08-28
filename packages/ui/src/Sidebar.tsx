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
import { ICON_BUTTON_BASE_CLASSNAME } from './iconButtonStyles';
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
 * SidebarModeCard/SidebarNavItem/SidebarSection below are this package's
 * own convenience layer on top of the primitives above — no shadcn
 * equivalent for SidebarModeCard specifically.
 */

const SIDEBAR_COOKIE_NAME = 'sidebar_state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
// Metronic's real $aside-config.width (src/metronic/sass/layout/_variables.scss)
// — a literal 300px, not rem-based, so no root-font-size scaling applies.
const SIDEBAR_WIDTH = '300px';
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
      // Same ICON_BUTTON_BASE_CLASSNAME as TopBar.tsx's IconButton —
      // despite living in this file, SidebarTrigger itself is rendered in
      // the TopBar, not inside <Sidebar>, so it's genuinely the same kind
      // of button, not a coincidence.
      className={cn(ICON_BUTTON_BASE_CLASSNAME, className)}
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

// p-4's 16px side padding, unreduced in collapsed mode, leaves only 16px
// of inner width inside the 48px (--sidebar-width-icon) rail — less than
// sidebarMenuButtonVariants' standard 36px (size-9) collapsed icon button
// needs, so it overflows past the rail's right edge and gets visually
// clipped by the sidebar's own overflow-hidden. px-1.5 (6px each side)
// leaves exactly 48 - 6*2 = 36px, centering that button with zero
// overflow. Shared by every direct padded slot (header/content/footer).
const SIDEBAR_SLOT_PADDING = 'p-4 group-data-[collapsible=icon]:px-1.5';

export function SidebarHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-col gap-2', SIDEBAR_SLOT_PADDING, className)}
      data-sidebar="header"
      {...props}
    />
  );
}

export function SidebarFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-col gap-2', SIDEBAR_SLOT_PADDING, className)}
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
        'flex min-h-0 flex-1 flex-col gap-4 overflow-auto',
        SIDEBAR_SLOT_PADDING,
        'group-data-[collapsible=icon]:overflow-hidden',
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
  // px-3 py-2 (12px/8px) matches Metronic's real aside menu-link padding
  // (src/metronic/sass/layout/aside/_menu.scss: padding-x 12px from
  // $aside-config, padding-top/bottom 0.55rem ≈ 7px at its real 13px
  // root) closely enough that an arbitrary px value isn't worth it.
  // text-[var(--nav-item-text)] applies regardless of active state —
  // Metronic's real menu-link-default-state()/menu-link-here-state() both
  // receive the exact same $title-color/$icon-color for every aside style
  // variant (src/metronic/sass/layout/aside/_menu.scss's $asides loop);
  // only the background differs between default and active/here.
  'flex w-full items-center gap-2.5 overflow-hidden rounded-lg px-3 py-2 text-left text-sm font-medium text-[var(--nav-item-text)] transition-colors group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0',
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
      // size-5 (20px) + the icon itself passed at size={20} by the
      // consumer — Metronic's real $aside-config.icon-size. Colored
      // separately from the label text (--nav-item-icon vs --nav-item-text)
      // — Metronic's real nav icon color is a distinct, more saturated
      // step from its title-text color, not inherited.
      <span className="flex size-5 shrink-0 items-center justify-center text-[var(--nav-item-icon)]">
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
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[var(--badge-brand-bg)] text-[var(--badge-brand-text)]">
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
