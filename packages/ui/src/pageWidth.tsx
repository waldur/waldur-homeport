import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
} from 'react';

import { BreakpointKey, resolveBreakpointPx } from './useMediaQuery';

/**
 * A width that page content lays itself out by, for the page-aware
 * breakpoint hooks. It is the same box the `page-*` Tailwind variants query:
 * homeport's page region inside the layout (PageWidthProvider), elsewhere
 * <body>, the fallback `page` container (design-tokens' variants.css).
 */
interface WidthStore {
  subscribe(listener: () => void): () => void;
  get(): number;
}

const createStore = () => {
  let width = 0;
  const listeners = new Set<() => void>();
  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    get: () => width,
    set(next: number) {
      if (next === width) return;
      width = next;
      listeners.forEach((listener) => listener());
    },
  };
};

/** The content-box width of `element`, as a container query reads it. */
const contentWidth = (element: HTMLElement) => {
  const style = getComputedStyle(element);
  return (
    element.clientWidth -
    parseFloat(style.paddingLeft || '0') -
    parseFloat(style.paddingRight || '0')
  );
};

/**
 * Outside the layout: <body>'s width, the window less any classic scrollbar,
 * measured lazily on first use.
 */
const documentStore = (() => {
  const store = createStore();
  let watching = false;
  const measure = () =>
    store.set(document.body ? contentWidth(document.body) : window.innerWidth);
  return {
    subscribe(listener: () => void) {
      if (!watching && typeof window !== 'undefined') {
        watching = true;
        measure();
        window.addEventListener('resize', measure);
        if (typeof ResizeObserver !== 'undefined' && document.body) {
          new ResizeObserver(measure).observe(document.body);
        }
      }
      return store.subscribe(listener);
    },
    get() {
      if (!watching && typeof window !== 'undefined') measure();
      return store.get();
    },
  };
})();

const PageWidthContext = createContext<WidthStore | null>(null);

/**
 * Measures `element` -- homeport's page region -- for the page-aware
 * breakpoint hooks below it.
 */
export const PageWidthProvider: FC<{
  element: HTMLElement | null;
  children: ReactNode;
}> = ({ element, children }) => {
  const store = useMemo(createStore, []);
  const value = useMemo<WidthStore>(
    () => ({
      subscribe: store.subscribe,
      // Until the element mounts, the window's: what it stands in for; and
      // until its first measurement lands, measured on the spot.
      get: () =>
        element ? store.get() || contentWidth(element) : documentStore.get(),
    }),
    [store, element],
  );
  useLayoutEffect(() => {
    if (!element) return;
    const measure = () => store.set(contentWidth(element));
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [element, store]);
  return (
    <PageWidthContext.Provider value={value}>
      {children}
    </PageWidthContext.Provider>
  );
};

/**
 * Whether the page's width passes `test`; re-renders only when the answer
 * changes, not on every pixel of a resize.
 */
const usePageWidthTest = (test: (width: number) => boolean): boolean => {
  const store = useContext(PageWidthContext) ?? documentStore;
  return useSyncExternalStore(
    store.subscribe,
    () => test(store.get()),
    () => test(Number.POSITIVE_INFINITY),
  );
};

/**
 * Whether the page is at least `breakpoint` wide: `useBreakpointUp` for page
 * content, which a docked drawer can make narrower than the window. Reads
 * the box the `page-*` variants query (see WidthStore).
 */
export function usePageBreakpointUp(
  breakpoint: BreakpointKey | number,
): boolean {
  const px = resolveBreakpointPx(breakpoint);
  return usePageWidthTest((width) => width >= px);
}

/** Whether the page is narrower than `breakpoint`; see usePageBreakpointUp. */
export function usePageBreakpointDown(
  breakpoint: BreakpointKey | number,
): boolean {
  const px = resolveBreakpointPx(breakpoint);
  return usePageWidthTest((width) => width < px);
}
