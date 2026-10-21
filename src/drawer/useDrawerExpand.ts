import { useCallback, useEffect } from 'react';

import { getFullscreenElement } from '@/core/fullscreen';

import { useDrawer } from './actions';

/**
 * Drives the drawer's expand ("full screen") toggle. The state lives in
 * DrawerContext; DrawerRoot widens the panel from it.
 */
export const useDrawerExpand = (): {
  expanded: boolean;
  toggle: () => void;
} => {
  const { expanded, setExpanded } = useDrawer();

  const toggle = useCallback(
    () => setExpanded(!expanded),
    [expanded, setExpanded],
  );

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
  }, [expanded, setExpanded]);

  return { expanded, toggle };
};
