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

let formatErrorResponse = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

/**
 * Sets how `showErrorResponse` turns an API error into text. Formatting is
 * app-specific (the app's API error shape, its config and i18n), so the app
 * registers its formatter once at startup, as it does i18n-runtime's
 * setMessageTransform. Until then, Error#message or the value itself.
 */
export const setErrorResponseFormatter = (
  formatter: (error: unknown) => string,
) => {
  formatErrorResponse = formatter;
};

/** An error toast for a failed request: `message`, then the error's details. */
export const showErrorResponse = (
  error: unknown,
  message?: string,
  options?: ToastOptions,
) => {
  const details = formatErrorResponse(error);
  showError(message ? `${message} ${details}` : details, options);
};

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
      // The app's registered formatter (setErrorResponseFormatter), or
      // Error#message / the value itself until one is registered.
      const fallback = formatErrorResponse(error);
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

export const useNotify = () => {
  // Memoized so callers using these in dependency arrays don't refire on render.
  return useMemo(
    () => ({
      showSuccess,
      showError,
      showInfo,
      showRedirectMessage,
      showPromise,
      showErrorResponse,
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
  errorResponse: showErrorResponse,
  dismiss,
};
