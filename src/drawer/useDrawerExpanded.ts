import { useEffect, useState } from 'react';

/**
 * Read-only view of the drawer's expanded ("full screen") state, observed from
 * `#kt_drawer[data-expanded]`.
 *
 * The expanded flag is written by {@link useDrawerExpand} (the toolbar toggle)
 * but lives in the legacy Metronic DOM, so consumers that only need to *read*
 * it — e.g. to reveal a master/detail sidebar when expanded — track it here via
 * a MutationObserver rather than through React state.
 *
 * TODO: migrate to a context exposed by DrawerProvider once it ships an
 * expanded flag, and drop this DOM coupling.
 */
export function useDrawerExpanded(): boolean {
  const [expanded, setExpanded] = useState(
    () => document.getElementById('kt_drawer')?.dataset.expanded === 'true',
  );
  useEffect(() => {
    const drawer = document.getElementById('kt_drawer');
    if (!drawer) return;
    const sync = () => setExpanded(drawer.dataset.expanded === 'true');
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(drawer, {
      attributes: true,
      attributeFilter: ['data-expanded'],
    });
    return () => observer.disconnect();
  }, []);
  return expanded;
}
