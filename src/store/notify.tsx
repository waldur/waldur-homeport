import { useMemo } from 'react';

import {
  NotifyService as BaseNotifyService,
  ToastOptions,
  showError,
  useNotify as useBaseNotify,
} from 'waldur-notifications';

import { format } from '@/core/ErrorMessageFormatter';

/**
 * The one piece waldur-notifications' own showX primitives can't provide:
 * turning an API error into readable text is app-specific (this app's own
 * @/core/ErrorMessageFormatter, tied to waldur-auth-core's error-interceptor
 * shape and @/i18n), so it's composed here on top of the shared package's
 * plain showError rather than living in it.
 */
const showErrorResponse = (
  error: unknown,
  message?: string,
  options?: ToastOptions,
) => {
  const details = format(error);
  const errorMessage = message ? `${message} ${details}` : details;
  showError(errorMessage, options);
};

export const useNotify = () => {
  const base = useBaseNotify();
  // Memoized so callers using this in dependency arrays don't refire on
  // render — base is itself referentially stable (see its own useMemo), so
  // this only ever recomputes once.
  return useMemo(() => ({ ...base, showErrorResponse }), [base]);
};

export const NotifyService = {
  ...BaseNotifyService,
  errorResponse: showErrorResponse,
};
