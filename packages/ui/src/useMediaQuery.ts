import { useCallback, useSyncExternalStore } from 'react';

/**
 * Standard grid breakpoints aligned across Waldur:
 * Bootstrap $grid-breakpoints, Tailwind screens, and core constants.
 */
export const BREAKPOINTS = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
  '2xl': 1400,
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

export const resolveBreakpointPx = (bp: BreakpointKey | number): number =>
  typeof bp === 'number' ? bp : BREAKPOINTS[bp];

/**
 * Subscribes to a CSS media query and returns whether it currently matches.
 * Uses React 18's useSyncExternalStore to guarantee consistent, tearing-free
 * reads without hydration flashes or layout shifts.
 *
 * @param query The CSS media query string, e.g. `(max-width: 767px)` or `(hover: none)`
 * @param serverFallback Fallback value when window.matchMedia is unavailable (SSR/tests)
 */
export function useMediaQuery(query: string, serverFallback = false): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (
        typeof window === 'undefined' ||
        typeof window.matchMedia !== 'function'
      ) {
        return () => undefined;
      }
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onStoreChange);
      return () => mql.removeEventListener('change', onStoreChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    ) {
      return serverFallback;
    }
    return window.matchMedia(query).matches;
  }, [query, serverFallback]);

  const getServerSnapshot = useCallback(() => serverFallback, [serverFallback]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Returns true when the viewport width is strictly below the given breakpoint.
 * Uses `(max-width: ${px - 1}px)` to avoid 1px boundary overlap with `useBreakpointUp`.
 *
 * @example
 * const isMobile = useBreakpointDown('md'); // (max-width: 767px)
 * const isSmall = useBreakpointDown(576);    // (max-width: 575px)
 */
export function useBreakpointDown(
  breakpoint: BreakpointKey | number,
  serverFallback = false,
): boolean {
  const px = resolveBreakpointPx(breakpoint);
  return useMediaQuery(`(max-width: ${px - 1}px)`, serverFallback);
}

/**
 * Returns true when the viewport width is at or above the given breakpoint.
 * Uses `(min-width: ${px}px)`.
 *
 * @example
 * const isDesktop = useBreakpointUp('lg'); // (min-width: 992px)
 * const isWide = useBreakpointUp(1200);    // (min-width: 1200px)
 */
export function useBreakpointUp(
  breakpoint: BreakpointKey | number,
  serverFallback = false,
): boolean {
  const px = resolveBreakpointPx(breakpoint);
  return useMediaQuery(`(min-width: ${px}px)`, serverFallback);
}

/**
 * Returns true when the viewport width is between min (inclusive) and max (exclusive).
 * Uses `(min-width: ${minPx}px) and (max-width: ${maxPx - 1}px)`.
 */
export function useBreakpointBetween(
  min: BreakpointKey | number,
  max: BreakpointKey | number,
  serverFallback = false,
): boolean {
  const minPx = resolveBreakpointPx(min);
  const maxPx = resolveBreakpointPx(max);
  return useMediaQuery(
    `(min-width: ${minPx}px) and (max-width: ${maxPx - 1}px)`,
    serverFallback,
  );
}

/**
 * Returns true when the primary pointer device cannot hover (e.g. mobile phones, touch tablets).
 * Useful for switching hover-only tooltips or menus to tap/click toggles.
 */
export function useNoHover(serverFallback = false): boolean {
  return useMediaQuery('(hover: none)', serverFallback);
}
