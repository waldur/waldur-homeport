import { useEffect } from 'react';

// Pending slide-out removals, keyed by class name so reopening the same drawer
// can cancel its own stale timer without touching other drawers'.
const pendingRemovals = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Owns a shell class on #kt_drawer for the lifetime of a drawer component. The
 * class turns the default panel into the rounded full-height floating card (and
 * hides the page overlay).
 *
 * The open* toggle handler adds the class before opening so the very first
 * slide-in already has the styles in place (the component mounts a frame later);
 * this hook re-asserts it on mount and owns teardown. Removal is delayed while
 * the drawer is still sliding out so the card doesn't snap back to the default
 * panel mid-animation; swapping straight to another drawer (drawer stays open)
 * removes it immediately, and the next drawer re-asserts its own class on mount.
 *
 * Reopening the same drawer within that slide-out window must cancel the pending
 * removal — otherwise the stale timer strips the shell class off the now-open
 * drawer and the Metronic page overlay flashes back in.
 */
export const useDrawerShellClass = (className: string) => {
  useEffect(() => {
    const pending = pendingRemovals.get(className);
    if (pending) {
      clearTimeout(pending);
      pendingRemovals.delete(className);
    }
    document.getElementById('kt_drawer')?.classList.add(className);
    return () => {
      const drawer = document.getElementById('kt_drawer');
      if (!drawer) return;
      if (drawer.classList.contains('drawer-on')) {
        drawer.classList.remove(className);
      } else {
        const timer = setTimeout(() => {
          document.getElementById('kt_drawer')?.classList.remove(className);
          pendingRemovals.delete(className);
        }, 350);
        pendingRemovals.set(className, timer);
      }
    };
  }, [className]);
};
