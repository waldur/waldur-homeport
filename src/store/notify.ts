import { useMemo } from 'react';
import { NewNotification } from 'reapop';

import { format } from '@/core/ErrorMessageFormatter';

type NotifyCallback = (notification: NewNotification) => void;
let globalNotify: NotifyCallback | null = null;

export const setGlobalNotify = (fn: NotifyCallback | null) => {
  globalNotify = fn;
};

const showSuccess = (title: string, message?: string) => {
  if (globalNotify) {
    globalNotify({
      status: 'success',
      title,
      message,
    });
  }
};

const showError = (title: string) => {
  if (globalNotify) {
    globalNotify({
      status: 'error',
      title,
    });
  }
};

const showInfo = (title: string) => {
  if (globalNotify) {
    globalNotify({
      status: 'info',
      title,
    });
  }
};

const showRedirectMessage = (title: string, message: string) => {
  if (globalNotify) {
    globalNotify({
      title,
      status: 'warning',
      message,
    });
  }
};

const showErrorResponse = (error: unknown, message?: string) => {
  const details = format(error);
  const errorMessage = message ? `${message} ${details}` : details;
  showError(errorMessage);
};

export const useNotify = () => {
  // Memoize the returned object so that callers using these handlers in
  // useEffect / useCallback dependency arrays don't refire on every parent render.
  return useMemo(
    () => ({
      showSuccess,
      showError,
      showInfo,
      showRedirectMessage,
      showErrorResponse,
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
};
