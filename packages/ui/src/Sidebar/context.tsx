import { createContext, useContext } from 'react';

/**
 * State and controls exposed by the Sidebar navigation context.
 */
export interface SidebarContextProps {
  /** Visual state of the desktop sidebar ('expanded' | 'collapsed'). */
  state: 'expanded' | 'collapsed';
  /** Whether the desktop sidebar is currently expanded. */
  open: boolean;
  /** Update the desktop expanded state. */
  setOpen: (open: boolean) => void;
  /** Whether the mobile drawer (Sheet) is currently open. */
  openMobile: boolean;
  /** Update the mobile drawer open state. */
  setOpenMobile: (open: boolean) => void;
  /** Whether the viewport is currently below the mobile breakpoint. */
  isMobile: boolean;
  /** Toggle the appropriate sidebar state (mobile drawer or desktop collapse). */
  toggleSidebar: () => void;
  /**
   * Whether a collapsed desktop sidebar is temporarily expanded on hover.
   * Suppresses item tooltips while expanded labels are already visible.
   */
  isHoverExpanded: boolean;
  /** Update the desktop hover-expanded state. */
  setIsHoverExpanded: (value: boolean) => void;
}

export const SidebarContext = createContext<SidebarContextProps | null>(null);

/**
 * Hook to access the current Sidebar state and action dispatchers.
 * Must be used within a `<SidebarProvider>`.
 */
export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }
  return context;
}

/**
 * Tracks nesting depth in hierarchical menus (`SidebarMenuSub` / `SidebarMenuAccordion`).
 * Used to calculate incremental indentation padding and bullet spacers.
 */
export const SidebarMenuSubDepthContext = createContext<number>(0);

/**
 * Hook to access the current menu nesting depth.
 * Returns 0 for top-level items, 1 for first nested level, etc.
 */
export function useSidebarSubDepth() {
  return useContext(SidebarMenuSubDepthContext);
}
