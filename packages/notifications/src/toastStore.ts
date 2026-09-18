import { ReactNode } from 'react';
import { AlertItemVariant, ToastAction } from 'waldur-ui';

export interface ToastItem {
  id: string | number;
  variant: AlertItemVariant;
  title: ReactNode;
  message?: ReactNode;
  actions?: ToastAction[];
  duration: number;
  open: boolean;
}

interface ShowOptions {
  id?: string | number;
  duration: number;
  actions?: ToastAction[];
}

// A >9-deep stack is already past the point of being read; the oldest
// excess toast is dropped outright rather than animated out.
const MAX_VISIBLE = 9;

// Long enough for Toast's own exit keyframe (.15s) to finish before the
// item leaves this store's array — removing it any earlier would unmount
// Radix's Toast.Root (and the DOM node its Presence is mid-animating)
// out from under the animation instead of letting it play out.
const REMOVE_DELAY = 200;

let items: ToastItem[] = [];
let counter = 0;
const listeners = new Set<() => void>();
const removalTimers = new Map<string | number, ReturnType<typeof setTimeout>>();

const emit = () => listeners.forEach((listener) => listener());

const clearRemovalTimer = (id: string | number) => {
  const timer = removalTimers.get(id);
  if (timer !== undefined) {
    clearTimeout(timer);
    removalTimers.delete(id);
  }
};

const remove = (id: string | number) => {
  clearRemovalTimer(id);
  const next = items.filter((item) => item.id !== id);
  if (next.length !== items.length) {
    items = next;
    emit();
  }
};

export const toastStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    return items;
  },
  /** Shows a toast, or updates one in place (same content, still open) if `options.id` matches an existing one. */
  show(
    variant: AlertItemVariant,
    title: ReactNode,
    message: ReactNode | undefined,
    options: ShowOptions,
  ): string | number {
    const id = options.id ?? `toast-${++counter}`;
    clearRemovalTimer(id);
    const next: ToastItem = {
      id,
      variant,
      title,
      message,
      actions: options.actions,
      duration: options.duration,
      open: true,
    };
    const existingIndex = items.findIndex((item) => item.id === id);
    if (existingIndex !== -1) {
      items = [
        ...items.slice(0, existingIndex),
        next,
        ...items.slice(existingIndex + 1),
      ];
    } else {
      items = [...items, next];
      if (items.length > MAX_VISIBLE) {
        items = items.slice(items.length - MAX_VISIBLE);
      }
    }
    emit();
    return id;
  },
  /** Dismiss a specific toast, or every open toast when called without an id. */
  dismiss(id?: string | number) {
    let changed = false;
    items = items.map((item) => {
      if (!item.open || (id !== undefined && item.id !== id)) return item;
      changed = true;
      clearRemovalTimer(item.id);
      removalTimers.set(
        item.id,
        setTimeout(() => remove(item.id), REMOVE_DELAY),
      );
      return { ...item, open: false };
    });
    if (changed) emit();
  },
};
