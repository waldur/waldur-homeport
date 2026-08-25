import { useEffect, useState } from 'react';

/**
 * shadcn's actual use-mobile hook (see
 * https://ui.shadcn.com/docs/components/sidebar) — matchMedia-based, not a
 * resize listener, so it only fires on an actual breakpoint crossing.
 * Sidebar.tsx uses this to switch between the desktop collapsible sidebar
 * and the mobile Sheet.
 *
 * Reads `mql.matches` (the CSS layout engine's own authoritative viewport
 * read), not shadcn's own upstream `window.innerWidth < MOBILE_BREAKPOINT`
 * recomputation — window.innerWidth measured 0 on this effect's very first
 * run in a real, reproducible case (a fresh page load in apps/micro-app-poc,
 * confirmed via direct instrumentation, not test-environment noise), which
 * incorrectly set isMobile to true at a genuine 1280px viewport. Because
 * matchMedia only fires 'change' on an actual breakpoint crossing, and a
 * legitimately-1280px viewport never crosses one, that wrong value never
 * self-corrected — the desktop sidebar silently stayed replaced by the
 * (closed, so invisible) mobile Sheet for the rest of the session.
 * mql.matches can't read a transient 0: it's evaluated against the
 * browser's real layout state, not a JS property that can be read before
 * that state is fully established.
 */
const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => setIsMobile(mql.matches);
    mql.addEventListener('change', onChange);
    setIsMobile(mql.matches);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return !!isMobile;
}
