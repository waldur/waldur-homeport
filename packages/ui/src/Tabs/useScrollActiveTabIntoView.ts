import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

/**
 * Keeps the active tab of a scrollable strip in view: on a narrow screen a deep
 * link to a late tab would otherwise open with the selected tab off-screen.
 *
 * It scrolls only the frame, sideways (`scrollIntoView` would also scroll the
 * page), and only when a different tab becomes active, so it never fights a
 * user who scrolls the strip by hand.
 */
export const useScrollActiveTabIntoView = <T extends HTMLElement>() => {
  const frameRef = useRef<T>(null);
  const lastActiveRef = useRef<Element | null>(null);

  const scrollToActive = useCallback(() => {
    const frame = frameRef.current;
    if (!frame) {
      return;
    }
    // Not `data-state`, which a Tooltip around a tab overwrites.
    const active = frame.querySelector(
      '[aria-selected="true"], [aria-current]',
    );
    if (!active) {
      lastActiveRef.current = null;
      return;
    }
    if (active === lastActiveRef.current) {
      return;
    }
    const frameBox = frame.getBoundingClientRect();
    const tabBox = active.getBoundingClientRect();
    // Do not record the active tab if either the container or the tab has not
    // yet obtained layout dimensions (e.g. initially hidden or zero-width mount).
    if (frameBox.width === 0 || tabBox.width === 0) {
      return;
    }
    lastActiveRef.current = active;
    if (tabBox.left < frameBox.left) {
      frame.scrollLeft -= frameBox.left - tabBox.left;
    } else if (tabBox.right > frameBox.right) {
      frame.scrollLeft += tabBox.right - frameBox.right;
    }
  }, []);

  // No deps: the active tab can change through any prop (`value`, `activeKey`,
  // an item's `active`), so look after every render. The query is cheap.
  useLayoutEffect(() => {
    scrollToActive();
  });

  // If the strip mounted in an initially hidden container (e.g. collapsed accordion
  // or drawer), scroll once layout dimensions become non-zero.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || typeof ResizeObserver === 'undefined') {
      return;
    }
    const observer = new ResizeObserver(() => {
      scrollToActive();
    });
    observer.observe(frame);
    return () => {
      observer.disconnect();
    };
  }, [scrollToActive]);

  return frameRef;
};
