import { useCallback } from 'react';

import { useNotify } from '@/store/notify';

import { getValidationErrors } from './utils';

/**
 * A mutation's onError that toasts only what the dialog does not show itself:
 * a validation error (400) is rendered inline, so repeating it as
 * "400: Bad Request. gid: …" adds nothing.
 */
export const useInlineErrorToast = (message: string) => {
  const { showErrorResponse } = useNotify();
  return useCallback(
    (error: unknown) => {
      if (!getValidationErrors(error)) {
        showErrorResponse(error, message);
      }
    },
    [showErrorResponse, message],
  );
};
