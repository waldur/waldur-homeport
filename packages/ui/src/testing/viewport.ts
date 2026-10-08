import { BREAKPOINTS, BreakpointKey } from '../useMediaQuery';

export const VIEWPORT_WIDTHS = {
  xs: 400,
  sm: 640,
  md: 800,
  lg: 1024,
  xl: 1280,
  xxl: 1440,
  '2xl': 1440,
  mobile: 400,
  tablet: 800,
  desktop: 1440,
} as const;

export type NamedViewport = keyof typeof VIEWPORT_WIDTHS;

export interface ViewportOptions {
  width?: NamedViewport | number;
  height?: number;
  hover?: boolean;
  colorScheme?: 'light' | 'dark';
}

export type ViewportTarget = NamedViewport | number | ViewportOptions;

export interface ViewportState {
  width: number;
  height: number;
  hover: boolean;
  colorScheme: 'light' | 'dark';
}

export const DEFAULT_VIEWPORT: ViewportState = {
  width: 1440,
  height: 960,
  hover: true,
  colorScheme: 'light',
};

let currentState: ViewportState = { ...DEFAULT_VIEWPORT };

export function getViewportState(): ViewportState {
  return { ...currentState };
}

type MqlListener = (event: { matches: boolean; media: string }) => void;

interface TrackedMQL {
  media: string;
  lastMatches: boolean;
  listeners: Set<MqlListener>;
  onchange: MqlListener | null;
}

const activeMQLs = new Set<TrackedMQL>();

export function evaluateCondition(cond: string, state: ViewportState): boolean {
  const minWidth = cond.match(/\(min-width:\s*(\d+)px\)/);
  if (minWidth && state.width < parseInt(minWidth[1], 10)) return false;

  const maxWidth = cond.match(/\(max-width:\s*(\d+)px\)/);
  if (maxWidth && state.width > parseInt(maxWidth[1], 10)) return false;

  const minHeight = cond.match(/\(min-height:\s*(\d+)px\)/);
  if (minHeight && state.height < parseInt(minHeight[1], 10)) return false;

  const maxHeight = cond.match(/\(max-height:\s*(\d+)px\)/);
  if (maxHeight && state.height > parseInt(maxHeight[1], 10)) return false;

  const hover = cond.match(/\(hover:\s*(hover|none)\)/);
  if (hover) {
    const expected = hover[1] === 'hover';
    if (state.hover !== expected) return false;
  }

  const colorScheme = cond.match(/\(prefers-color-scheme:\s*(light|dark)\)/);
  if (colorScheme) {
    if (state.colorScheme !== colorScheme[1]) return false;
  }

  return true;
}

export function evaluateMediaQuery(
  query: string,
  state: ViewportState = currentState,
): boolean {
  const trimmed = query.trim();
  if (!trimmed || trimmed === 'all') return true;

  const commaBranches = trimmed.split(/\s*,\s*/);
  return commaBranches.some((branch) => {
    const conditions = branch.match(/\([^)]+\)/g);
    if (!conditions) return true;
    return conditions.every((cond) => evaluateCondition(cond, state));
  });
}

function resolveWidth(target: NamedViewport | number): number {
  if (typeof target === 'number') return target;
  if (target in VIEWPORT_WIDTHS) return VIEWPORT_WIDTHS[target];
  if (target in BREAKPOINTS) return BREAKPOINTS[target as BreakpointKey];
  return DEFAULT_VIEWPORT.width;
}

export function createVirtualMediaQueryList(query: string): MediaQueryList {
  const tracked: TrackedMQL = {
    media: query,
    lastMatches: evaluateMediaQuery(query, currentState),
    listeners: new Set(),
    onchange: null,
  };

  activeMQLs.add(tracked);

  const mql: MediaQueryList = {
    media: query,
    get matches() {
      return evaluateMediaQuery(query, currentState);
    },
    onchange: null,
    addListener(fn: (e: MediaQueryListEvent) => void) {
      this.addEventListener('change', fn as any);
    },
    removeListener(fn: (e: MediaQueryListEvent) => void) {
      this.removeEventListener('change', fn as any);
    },
    addEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
    ) {
      if (type === 'change' && typeof listener === 'function') {
        tracked.listeners.add(listener as unknown as MqlListener);
      }
    },
    removeEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
    ) {
      if (type === 'change' && typeof listener === 'function') {
        tracked.listeners.delete(listener as unknown as MqlListener);
      }
    },
    dispatchEvent(event: Event): boolean {
      if (event.type === 'change') {
        const customEvent = event as unknown as {
          matches: boolean;
          media: string;
        };
        tracked.listeners.forEach((l) => l(customEvent));
        tracked.onchange?.(customEvent);
      }
      return true;
    },
  };

  return mql;
}

function applyWindowDimension(prop: 'innerWidth' | 'innerHeight', val: number) {
  try {
    (window as any)[prop] = val;
  } catch {
    try {
      Object.defineProperty(window, prop, {
        value: val,
        writable: true,
        configurable: true,
      });
    } catch {
      // ignore if non-configurable
    }
  }
}

export function setViewport(target: ViewportTarget) {
  let nextWidth = currentState.width;
  let nextHeight = currentState.height;
  let nextHover = currentState.hover;
  let nextColorScheme = currentState.colorScheme;

  if (typeof target === 'string' || typeof target === 'number') {
    nextWidth = resolveWidth(target);
  } else if (typeof target === 'object' && target !== null) {
    if (target.width !== undefined) nextWidth = resolveWidth(target.width);
    if (target.height !== undefined) nextHeight = target.height;
    if (target.hover !== undefined) nextHover = target.hover;
    if (target.colorScheme !== undefined) nextColorScheme = target.colorScheme;
  }

  currentState = {
    width: nextWidth,
    height: nextHeight,
    hover: nextHover,
    colorScheme: nextColorScheme,
  };

  if (typeof window !== 'undefined') {
    applyWindowDimension('innerWidth', nextWidth);
    applyWindowDimension('innerHeight', nextHeight);
  }

  // Notify active media queries whose matches state changed
  activeMQLs.forEach((tracked) => {
    const matches = evaluateMediaQuery(tracked.media, currentState);
    if (matches !== tracked.lastMatches) {
      tracked.lastMatches = matches;
      const event = { matches, media: tracked.media };
      tracked.listeners.forEach((listener) => {
        try {
          listener(event);
        } catch {
          // ignore callback error in tests
        }
      });
      if (tracked.onchange) {
        try {
          tracked.onchange(event);
        } catch {
          // ignore callback error
        }
      }
    }
  });

  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new Event('resize'));
    } catch {
      // ignore
    }
  }
}

export function resetViewport() {
  setViewport(DEFAULT_VIEWPORT);
}

export function setupVirtualViewport() {
  if (typeof window !== 'undefined') {
    applyWindowDimension('innerWidth', DEFAULT_VIEWPORT.width);
    applyWindowDimension('innerHeight', DEFAULT_VIEWPORT.height);
    window.matchMedia = (query: string) => createVirtualMediaQueryList(query);
    (window as any).setViewport = setViewport;
    (window as any).resetViewport = resetViewport;
  }
}
