import { useEffect, useRef } from 'react';

import {
  applySidebarStyle,
  ConfiguredSidebarStyle,
  resolveSidebarStyle,
} from 'waldur-design-tokens';
import { useSidebar } from 'waldur-ui';

import { ENV } from '@/core/config';
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

  // Auto-minimize on medium desktop widths (768–1399px), ported from the
  // production BrandName.tsx's own resize effect — same band, same
  // "only when the user hasn't manually toggled" gate, now driving the new
  // sidebar's setOpen directly (the effect above publishes the result).
  // Uses refs for open and setOpen so the window resize listener is registered
  // once on mount rather than re-registering and re-running on every open state change.
  useEffect(() => {
    const handleResize = () => {
      if (userToggledRef.current) return;
      const width = window.innerWidth;
      const shouldMinimize = width >= 768 && width < 1400;
      const currentOpen = openRef.current;
      if (shouldMinimize && currentOpen) {
        setOpenRef.current(false);
      } else if (!shouldMinimize && width >= 1400 && !currentOpen) {
        setOpenRef.current(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sidebar style-variant token: reactive to theme changes so 'auto' keeps
  // following the app's light/dark toggle, matching the inline logic this
  // replaces in the pre-migration Sidebar.tsx/BrandName.tsx.
  useEffect(() => {
    const configured = (ENV.plugins.WALDUR_CORE.SIDEBAR_STYLE ||
      'dark') as ConfiguredSidebarStyle;
    applySidebarStyle(resolveSidebarStyle(configured, theme));
  }, [theme]);

  return {
    /** Call from the sidebar trigger's onClick — marks the collapse state
     * as user-chosen so the auto-minimize-on-resize effect above stops
     * overriding it, matching BrandName.tsx's own setUserHasToggled(true). */
    markUserToggled: () => {
      userToggledRef.current = true;
    },
  };
}
