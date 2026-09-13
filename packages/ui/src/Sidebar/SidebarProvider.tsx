import {
  ComponentProps,
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { cn } from '../cn';
import { useIsMobile } from '../useIsMobile';

import { SidebarContext, SidebarContextProps } from './context';

/** Default expanded width of the desktop sidebar. */
const SIDEBAR_WIDTH = '300px';
/** Width of the collapsed icon-only sidebar rail. */
const SIDEBAR_WIDTH_ICON = '3rem';

/**
 * Props for the `SidebarProvider` component.
 */
export interface SidebarProviderProps extends ComponentProps<'div'> {
  /** Initial desktop open state when uncontrolled. Defaults to true. */
  defaultOpen?: boolean;
  /** Controlled desktop open state. */
  open?: boolean;
  /** Callback fired when the desktop open state changes. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Viewport breakpoint (in pixels) below which the sidebar shifts to mobile drawer mode.
   * Defaults to 768px (standard md breakpoint).
   */
  mobileBreakpoint?: number;
  /**
   * Whether to render an outer layout `<div>` establishing `--sidebar-width` variables.
   * When `false`, variables are injected into `document.documentElement`, allowing
   * consumers with custom outer page shells to omit the extra wrapping DOM node.
   * @default true
   */
  renderWrapper?: boolean;
}

/**
 * Context provider managing responsive sidebar states, dimensions, and toggle actions.
 */
export function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  mobileBreakpoint,
  renderWrapper = true,
  className,
  style,
  children,
  ...props
}: SidebarProviderProps) {
  const isMobile = useIsMobile(mobileBreakpoint);
  const [openMobile, setOpenMobile] = useState(false);
  const [openState, setOpenState] = useState(defaultOpen);
  const open = openProp ?? openState;
  const [isHoverExpanded, setIsHoverExpanded] = useState(false);

  const setOpen = useCallback(
    (value: boolean | ((current: boolean) => boolean)) => {
      const next = typeof value === 'function' ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(next);
      } else {
        setOpenState(next);
      }
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
      isHoverExpanded,
      setIsHoverExpanded,
    }),
    [
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      toggleSidebar,
      isHoverExpanded,
    ],
  );

  const cssVars = {
    '--sidebar-width': SIDEBAR_WIDTH,
    '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
    ...style,
  } as CSSProperties;

  // When renderWrapper=false, bind CSS variables to the document root so that
  // descendant Sidebar and SidebarInset elements inherit them across custom layouts.
  useEffect(() => {
    if (renderWrapper) return;
    const root = document.documentElement;
    root.style.setProperty('--sidebar-width', cssVars['--sidebar-width']);
    root.style.setProperty(
      '--sidebar-width-icon',
      cssVars['--sidebar-width-icon'],
    );
  }, [
    renderWrapper,
    cssVars['--sidebar-width'],
    cssVars['--sidebar-width-icon'],
  ]);

  if (!renderWrapper) {
    return (
      <SidebarContext.Provider value={contextValue}>
        {children}
      </SidebarContext.Provider>
    );
  }

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        style={cssVars}
        className={cn('flex min-h-svh w-full', className)}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}
