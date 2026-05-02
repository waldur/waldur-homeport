import { useDispatch } from 'react-redux';
import { notify } from 'reapop';

import { format } from '@/core/ErrorMessageFormatter';
import store from '@/store/store';

const showSuccess = (title: string, message = undefined) =>
  notify({
    status: 'success',
    title,
    message,
    position: 'top-right',
    dismissAfter: 7000,
    showDismissButton: true,
    dismissible: true,
  });

const showError = (title: string) =>
  notify({
    status: 'error',
    title,
    position: 'top-right',
    dismissAfter: 7000,
    showDismissButton: true,
    dismissible: true,
  });

const showInfo = (title: string) =>
  notify({
    status: 'info',
    title,
    position: 'top-right',
    dismissAfter: 7000,
    showDismissButton: true,
    dismissible: true,
  });

const showRedirectMessage = (title: string, message: string) =>
  notify({
    title,
    status: 'warning',
    message,
    position: 'top-right',
    showDismissButton: true,
    dismissible: true,
  });

const showErrorResponse = (error: unknown, message?: string) => {
  const details = format(error);
  const errorMessage = message ? `${message} ${details}` : details;
  return showError(errorMessage);
};

export const useNotify = () => {
  const dispatch = useDispatch();
  return {
    showSuccess: (title: string, message?: string) =>
      dispatch(showSuccess(title, message)),
    showError: (message: string) => dispatch(showError(message)),
    showInfo: (message: string) => dispatch(showInfo(message)),
    showRedirectMessage: (title: string, message?: string) =>
      dispatch(showRedirectMessage(title, message)),
    showErrorResponse: (error: any, message: string | null = null) =>
      dispatch(showErrorResponse(error, message)),
  };
};

export const NotifyService = {
  success: (title: string, message?: string) =>
    store.dispatch(showSuccess(title, message)),
  error: (title: string) => store.dispatch(showError(title)),
  info: (title: string) => store.dispatch(showInfo(title)),
  warning: (title: string, message: string) =>
    store.dispatch(showRedirectMessage(title, message)),
  errorResponse: (error: unknown, message?: string) =>
    store.dispatch(showErrorResponse(error, message)),
};
