import { ReactNode, useMemo } from 'react';
import { AlertItemVariant, ToastAction } from 'waldur-ui';

import { toastStore } from './toastStore';

const DEFAULT_DURATION = 7000;

export interface ToastOptions {
  /** Buttons under the message, e.g. Undo or View resource. */
  actions?: ToastAction[];
  /** Reuse an id to replace an existing toast instead of stacking a duplicate. */
  id?: string | number;
  duration?: number;
}

export const show = (
  variant: AlertItemVariant,
  title: ReactNode,
  message?: ReactNode,
  options: ToastOptions = {},
) =>
  toastStore.show(variant, title, message, {
    id: options.id,
    duration: options.duration ?? DEFAULT_DURATION,
    actions: options.actions,
  });

export const showSuccess = (
  title: string,
  message?: string,
  options?: ToastOptions,
) => {
  show('success', title, message, options);
};

export const showError = (title: string, options?: ToastOptions) => {
  show('error', title, undefined, options);
};

export const showInfo = (title: string, options?: ToastOptions) => {
  show('info', title, undefined, options);
};

export const showRedirectMessage = (
  title: string,
  message: string,
  options?: ToastOptions,
) => {
  show('warning', title, message, options);
};

/** Dismiss a specific toast, or every toast when called without an id. */
export const dismiss = (id?: string | number) => toastStore.dismiss(id);

/**
 * Shows a pending toast that turns into success or error in place. Resolves to
 * undefined on failure rather than rejecting — the toast is the error report.
 */
export const showPromise = <T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((result: T) => string);
    error?: string | ((error: unknown) => string);
  },
): Promise<T | undefined> => {
  const id = show('info', messages.loading, undefined, {
    duration: Infinity,
  });

  return promise.then(
    (result) => {
      show(
        'success',
        typeof messages.success === 'function'
          ? messages.success(result)
          : messages.success,
        undefined,
        { id },
      );
      return result;
    },
    (error) => {
      // No injectable app-specific error formatter here (see this module's
      // own doc comment) — Error#message covers the common case, falling
      // back to the value itself for anything else (a plain string reject,
      // a DRF-shaped object with no `message` property, ...).
      const fallback = error instanceof Error ? error.message : String(error);
      const title =
        typeof messages.error === 'function'
          ? messages.error(error)
          : (messages.error ?? fallback);
      show('error', title, undefined, { id });
      // The toast is the error report; re-throwing would make every
      // fire-and-forget call an unhandled rejection.
      return undefined;
    },
  );
};

/**
 * No `errorResponse`/`showErrorResponse` here: formatting an error into a
 * message is app-specific (it depends on that app's own API error shape and
 * i18n setup) — see waldur-homeport's src/store/notify.tsx for how it
 * composes one on top of this package's plain `showError`.
 */
export const useNotify = () => {
  // Memoized so callers using these in dependency arrays don't refire on render.
  return useMemo(
    () => ({
      showSuccess,
      showError,
      showInfo,
      showRedirectMessage,
      showPromise,
      dismiss,
    }),
    [],
  );
};

export const NotifyService = {
  success: showSuccess,
  error: showError,
  info: showInfo,
  warning: showRedirectMessage,
  promise: showPromise,
  dismiss,
};
