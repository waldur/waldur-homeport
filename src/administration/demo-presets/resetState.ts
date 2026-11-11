import { useSyncExternalStore } from 'react';

/**
 * Whether a demo preset is loading, as this tab knows it: set when the staff
 * user starts a load here, or when the API answers 503 with `demo_reset`.
 * Kept outside Redux and React Query, since both are emptied when the load
 * finishes and the page reloads.
 */
interface DemoReset {
  preset: string;
}

let current: DemoReset | null = null;
const listeners = new Set<() => void>();

export const startDemoReset = (preset: string) => {
  // The first 503 names the preset; the ones after it change nothing.
  if (current) {
    return;
  }
  current = { preset };
  listeners.forEach((listener) => listener());
};

/** For tests only: a tab's reset ends with a full page reload. */
export const clearDemoReset = () => {
  current = null;
  listeners.forEach((listener) => listener());
};

export const getDemoReset = () => current;

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const useDemoReset = () => useSyncExternalStore(subscribe, getDemoReset);

/** A 503 the API answers with while a demo preset loads. */
export const isDemoResetError = (error: any): boolean =>
  error?.demo_reset === true || error?.data?.demo_reset === true;
