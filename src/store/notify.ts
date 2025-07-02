import { notify } from 'reapop';

import { format } from '@waldur/core/ErrorMessageFormatter';

export const showSuccess = (message, title = undefined) =>
  notify({
    status: 'success',
    title,
    message,
    position: 'top-right',
    dismissAfter: 7000,
    showDismissButton: true,
    dismissible: true,
  });

export const showError = (message) =>
  notify({
    status: 'error',
    message,
    position: 'top-right',
    dismissAfter: 7000,
    showDismissButton: true,
    dismissible: true,
  });

export const showInfo = (message) =>
  notify({
    status: 'info',
    message,
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

export const showErrorResponse = (response: Response, message?: string) => {
  const details = format(response);
  const errorMessage = message ? `${message} ${details}` : details;
  return showError(errorMessage);
};
