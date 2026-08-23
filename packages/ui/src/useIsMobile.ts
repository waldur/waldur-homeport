import { useEffect, useState } from 'react';

/**
 * shadcn's actual use-mobile hook (see
 * https://ui.shadcn.com/docs/components/sidebar) — matchMedia-based, not a
 * resize listener, so it only fires on an actual breakpoint crossing.
 * Sidebar.tsx uses this to switch between the desktop collapsible sidebar
 * and the mobile Sheet.
 */
const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener('change', onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return !!isMobile;
}
