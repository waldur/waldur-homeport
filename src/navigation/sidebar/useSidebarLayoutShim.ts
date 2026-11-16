import { useEffect, useRef } from 'react';

import {
  applySidebarStyle,
  ConfiguredSidebarStyle,
  resolveSidebarStyle,
} from 'waldur-design-tokens';
import { usePageBreakpointUp, useSidebar } from 'waldur-ui';

import { ENV } from '@/core/config';
import { useOptionalDrawer } from '@/drawer/actions';
import { useTheme } from '@/theme/useTheme';

/**
 * The width the sidebar takes beside the page: the full or the icon-rail
 * width, or none below the desktop breakpoint, where it opens over the page.
 * `--layout-sidebar-width` on <html> is what the drawers (which render
 * outside SidebarProvider) and the expandable table rows size themselves by.
 */
export const getSidebarWidthStyle = (
  collapsed: boolean,
  mobile: boolean,
): Record<string, string> => ({
  '--layout-sidebar-width': mobile
    ? '0px'
    : collapsed
      ? 'var(--sidebar-width-icon)'
      : 'var(--sidebar-width)',
});

/**
 * Keeps the rest of the app in step with waldur-ui's Sidebar, the source of
 * truth for open/collapsed state: publishes the width it takes
 * (getSidebarWidthStyle), applies the configured sidebar colour style, and
 * auto-minimizes the sidebar on medium desktop widths until the user
 * toggles it.
 */
export function useSidebarLayoutShim() {
  const { state, open, setOpen, isMobile } = useSidebar();
  const { theme } = useTheme();
  const userToggledRef = useRef(false);
  const openRef = useRef(open);
  openRef.current = open;
  const setOpenRef = useRef(setOpen);
  setOpenRef.current = setOpen;

  useEffect(() => {
    const style = getSidebarWidthStyle(state === 'collapsed', isMobile);
    const root = document.documentElement.style;
    Object.entries(style).forEach(([name, value]) =>
      root.setProperty(name, value),
    );
    return () => {
      Object.keys(style).forEach((name) => root.removeProperty(name));
    };
  }, [state, isMobile]);

  // Auto-minimize on medium desktop widths (768–1399px), unless the user
  // has manually toggled the sidebar. The width is the page's (the layout's
  // page region, sidebar included): a drawer docked beside the page narrows
  // it as a narrower window would. The page region leaves out a classic
  // scrollbar, which the window's width counts; added back, so that with no
  // drawer docked the thresholds fall where they always have. Only crossing
  // a threshold re-runs this, not each pixel of a resize.
  // A document not laid out yet (clientWidth 0) has no scrollbar to count.
  const documentWidth =
    typeof document === 'undefined' ? 0 : document.documentElement.clientWidth;
  const scrollbar =
    documentWidth > 0 ? Math.max(0, window.innerWidth - documentWidth) : 0;
  const medium = usePageBreakpointUp(768 - scrollbar);
  const wide = usePageBreakpointUp(1400 - scrollbar);
  // Beside a docked drawer the sidebar collapses to its rail at any width:
  // below 768px a window would turn it into a sheet opened from the header,
  // but the header goes by the window and offers no button for one here.
  const besideDrawer = Boolean(useOptionalDrawer()?.besidePage);
  useEffect(() => {
    if (userToggledRef.current) return;
    const shouldMinimize = !wide && (medium || besideDrawer);
    if (shouldMinimize && openRef.current) {
      setOpenRef.current(false);
    } else if (wide && !openRef.current) {
      setOpenRef.current(true);
    }
  }, [medium, wide, besideDrawer]);

  // Sidebar style-variant token: reactive to theme changes so 'auto' keeps
  // following the app's light/dark toggle.
  useEffect(() => {
    const configured = (ENV.plugins.WALDUR_CORE.SIDEBAR_STYLE ||
      'dark') as ConfiguredSidebarStyle;
    applySidebarStyle(resolveSidebarStyle(configured, theme));
  }, [theme]);

  return {
    /** Call from the sidebar trigger's onClick — marks the collapse state
     * as user-chosen so the auto-minimize-on-resize effect stops overriding it. */
    markUserToggled: () => {
      userToggledRef.current = true;
    },
  };
}
