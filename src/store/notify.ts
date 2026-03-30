import { notify } from 'reapop';

import { format } from '@waldur/core/ErrorMessageFormatter';

export const showSuccess = (title, message = undefined) =>
  notify({
    status: 'success',
    title,
    message,
    position: 'top-right',
    dismissAfter: 7000,
    showDismissButton: true,
    dismissible: true,
  });

export const showError = (title) =>
  notify({
    status: 'error',
    title,
    position: 'top-right',
    dismissAfter: 7000,
    showDismissButton: true,
    dismissible: true,
  });

export const showInfo = (title) =>
  notify({
    status: 'info',
    title,
    position: 'top-right',
    dismissAfter: 7000,
    showDismissButton: true,
    dismissible: true,
  });

export const showRedirectMessage = (title, message) =>
  notify({
    title,
    status: 'warning',
    message,
    position: 'top-right',
    showDismissButton: true,
    dismissible: true,
  });

export const showErrorResponse = (error: unknown, message?: string) => {
  const details = format(error);
  const errorMessage = message ? `${message} ${details}` : details;
  return showError(errorMessage);
};
