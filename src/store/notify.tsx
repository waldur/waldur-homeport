import { ReactNode, useMemo } from 'react';
import { toast } from 'sonner';

import { AlertItemVariant } from 'waldur-ui';

import { format } from '@/core/ErrorMessageFormatter';
import { Toast, ToastAction } from '@/notification/Toast';

const DEFAULT_DURATION = 7000;

interface ToastOptions {
  /** Buttons under the message, e.g. Undo or View resource. */
  actions?: ToastAction[];
  /** Reuse an id to replace an existing toast instead of stacking a duplicate. */
  id?: string | number;
  duration?: number;
}

const show = (
  variant: AlertItemVariant,
  title: ReactNode,
  message?: ReactNode,
  options: ToastOptions = {},
) =>
  toast.custom(
    (id) => (
      <Toast
        id={id}
        variant={variant}
        title={title}
        message={message}
        actions={options.actions}
      />
    ),
    {
      id: options.id,
      duration: options.duration ?? DEFAULT_DURATION,
      unstyled: true,
    },
  );

const showSuccess = (
  title: string,
  message?: string,
  options?: ToastOptions,
) => {
  show('success', title, message, options);
};

const showError = (title: string, options?: ToastOptions) => {
  show('error', title, undefined, options);
};

const showInfo = (title: string, options?: ToastOptions) => {
  show('info', title, undefined, options);
};

const showRedirectMessage = (
  title: string,
  message: string,
  options?: ToastOptions,
) => {
  show('warning', title, message, options);
};

const showErrorResponse = (
  error: unknown,
  message?: string,
  options?: ToastOptions,
) => {
  const details = format(error);
  const errorMessage = message ? `${message} ${details}` : details;
  showError(errorMessage, options);
};

/** Dismiss a specific toast, or every toast when called without an id. */
const dismiss = (id?: string | number) => toast.dismiss(id);

/**
 * Shows a pending toast that turns into success or error in place. Resolves to
 * undefined on failure rather than rejecting — the toast is the error report.
 */
const showPromise = <T,>(
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
      const title =
        typeof messages.error === 'function'
          ? messages.error(error)
          : (messages.error ?? format(error));
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
      showErrorResponse,
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
  errorResponse: showErrorResponse,
  promise: showPromise,
  dismiss,
};
