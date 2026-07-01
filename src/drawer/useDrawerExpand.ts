import { useCallback, useEffect, useState } from 'react';

import { getFullscreenElement } from '@/core/fullscreen';

const DRAWER_WIDTH_DEFAULT = '800px';

const getExpandedWidth = () => {
  const isMinimized =
    document.body.getAttribute('data-kt-aside-minimize') === 'on';
  const asideWidth = isMinimized ? 75 : 300;
  return `calc(100% - ${asideWidth}px - 8px)`;
};

const setDrawerWidth = (width: string) => {
  const drawer = document.getElementById('kt_drawer');
  if (drawer) {
    drawer.style.width = width;
  }
};

/**
 * Drives the drawer's expand ("full screen") toggle. State lives both in React
 * (for the toolbar icon) and on `#kt_drawer[data-expanded]`/its inline width,
 * because the panel body reads the DOM attribute and Metronic owns the width.
 */
export const useDrawerExpand = (): {
  expanded: boolean;
  toggle: () => void;
} => {
  const [expanded, setExpanded] = useState(false);

  const toggle = useCallback(() => {
    const drawer = document.getElementById('kt_drawer');
    const isCurrentlyExpanded = drawer?.dataset.expanded === 'true';
    const next = !isCurrentlyExpanded;
    setExpanded(next);
    setDrawerWidth(next ? getExpandedWidth() : DRAWER_WIDTH_DEFAULT);
    if (drawer) drawer.dataset.expanded = String(next);
  }, []);

  // Collapse expanded view immediately on any window resize
  useEffect(() => {
    if (!expanded) return;

    // Entering/exiting the in-call browser fullscreen fires a window resize.
    // That's a transient viewport change, not a layout resize, so it must not
    // collapse the expanded drawer — otherwise leaving a call's fullscreen
    // strands the user in the narrow panel instead of the expanded view.
    let fsTransition: ReturnType<typeof setTimeout> | null = null;
    const markFsTransition = () => {
      if (fsTransition) clearTimeout(fsTransition);
      fsTransition = setTimeout(() => {
        fsTransition = null;
      }, 600);
    };

    const collapse = () => {
      if (fsTransition || getFullscreenElement()) return;
      setExpanded(false);
      setDrawerWidth(DRAWER_WIDTH_DEFAULT);
      const drawer = document.getElementById('kt_drawer');
      if (drawer) drawer.dataset.expanded = 'false';
    };

    document.addEventListener('fullscreenchange', markFsTransition);
    document.addEventListener('webkitfullscreenchange', markFsTransition);
    window.addEventListener('resize', collapse);
    return () => {
      if (fsTransition) clearTimeout(fsTransition);
      document.removeEventListener('fullscreenchange', markFsTransition);
      document.removeEventListener('webkitfullscreenchange', markFsTransition);
      window.removeEventListener('resize', collapse);
    };
  }, [expanded]);

  // Metronic's DrawerComponent re-applies its default breakpoint width to
  // #kt_drawer on every update — window resize, drawerProps change, drawer
  // re-init — clobbering the imperative expanded width. While expanded that
  // silently shrinks the drawer back to the panel width even though
  // `data-expanded` stays true, so the expanded two-pane layout renders
  // cramped into the narrow drawer. Re-assert the expanded width whenever
  // Metronic resets it to a fixed (non-calc) value; the calc() guard makes the
  // observer's own write a no-op so it can't loop, and the data-expanded gate
  // yields to a deliberate collapse.
  useEffect(() => {
    if (!expanded) return;
    const drawer = document.getElementById('kt_drawer');
    if (!drawer || typeof MutationObserver === 'undefined') return;
    const enforce = () => {
      if (drawer.dataset.expanded !== 'true') return;
      if (!drawer.style.width.startsWith('calc')) {
        setDrawerWidth(getExpandedWidth());
      }
    };
    enforce();
    const observer = new MutationObserver(enforce);
    observer.observe(drawer, {
      attributes: true,
      attributeFilter: ['style'],
    });
    return () => observer.disconnect();
  }, [expanded]);

  useEffect(() => {
    return () => {
      setDrawerWidth(DRAWER_WIDTH_DEFAULT);
      const drawer = document.getElementById('kt_drawer');
      drawer?.removeAttribute('data-expanded');
    };
  }, []);

  return { expanded, toggle };
};
