import { AxiosResponse } from 'axios';
import { notify } from 'reapop';

import { format } from '@waldur/core/ErrorMessageFormatter';

export const showSuccess = (message) =>
  notify({
    status: 'success',
    message,
    position: 'top-right',
    dismissAfter: 2000,
  });

export const showError = (message) =>
  notify({
    status: 'error',
    message,
    position: 'top-right',
    dismissAfter: 2000,
  });

export const showErrorResponse = (
  response: AxiosResponse,
  message?: string,
) => {
  const details = format(response);
  const errorMessage = `${message}. ${details}`;
  return showError(errorMessage);
};
