import { useEffect, useRef } from 'react';

import {
  applySidebarStyle,
  ConfiguredSidebarStyle,
  resolveSidebarStyle,
} from 'waldur-design-tokens';
import { useSidebar } from 'waldur-ui';

import { ENV } from '@/core/config';
import { useLayout } from '@/metronic/layout/core';
import { useTheme } from '@/theme/useTheme';

/**
 * Bridges waldur-ui's Sidebar (the new source of truth for open/collapsed
 * state) into homeport's own Metronic layout config, whose `aside.minimized`
 * boolean several unrelated pieces of the app still depend on:
 * AppHeader/Toolbar/_main.scss's content-offset padding-left (via the body
 * classes/attributes LayoutSetup.initAside derives from it) and
 * LLMChatDrawer's own minimize-flip-detection effect. See this repo's
 * sidebar migration plan for the full rationale — in short, LayoutProvider's
 * setLayout() rebuilds every body class from this config on *every* call
 * (LayoutProvider.tsx), so nothing here writes to document.body directly;
 * mirroring into `layout.config.aside.minimized` is the only thing needed
 * for those consumers to keep working unchanged.
 */
export function useSidebarLayoutShim() {
  const { state, open, setOpen } = useSidebar();
  const layout = useLayout();
  const { theme } = useTheme();
  const userToggledRef = useRef(false);
  const openRef = useRef(open);
  openRef.current = open;
  const setOpenRef = useRef(setOpen);
  setOpenRef.current = setOpen;

  useEffect(() => {
    const minimized = state === 'collapsed';
    if (layout.config.aside.minimized === minimized) return;
    layout.setLayout({ aside: { ...layout.config.aside, minimized } });
    // layout.config/layout.setLayout are a fresh object/closure every
    // render (LayoutProvider holds no memoization) — depending on `state`
    // alone, with the redundant-write guard above, is what keeps this from
    // looping.
  }, [state]);

  // Auto-minimize on medium desktop widths (768–1399px), ported from the
  // production BrandName.tsx's own resize effect — same band, same
  // "only when the user hasn't manually toggled" gate, now driving the new
  // sidebar's setOpen directly (the effect above keeps
  // layout.config.aside.minimized mirrored as a side effect).
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
