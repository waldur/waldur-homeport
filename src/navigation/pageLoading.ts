import { ComponentType, lazy } from 'react';

// Page code chunks still downloading, so the route loading bar can wait for them.
let pending = 0;
const listeners = new Set<() => void>();

export const getPendingChunks = () => pending;

export const onPendingChunksChange = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notify = () => listeners.forEach((listener) => listener());

export const trackChunk = <T>(promise: Promise<T>) => {
  pending += 1;
  notify();
  return promise.finally(() => {
    pending -= 1;
    notify();
  });
};

// React.lazy whose download the route loading bar waits for, for page content
// that is code-split below the route's own lazyComponent.
export const trackedLazy = <T extends ComponentType<any>>(
  loader: () => Promise<{ default: T }>,
) => lazy(() => trackChunk(loader()));
