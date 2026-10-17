import { useCallback } from 'react';

import { formatErrorObject, getErrorBody } from '@/core/ErrorMessageFormatter';
import { useNotify } from '@/store/notify';

import { getMatrixErrorMessage } from '../matrixErrorMessage';

/**
 * Waldur's answer for a draft the requester can no longer act on: sent,
 * cancelled, expired, or no longer theirs to send.
 */
export const isTicketDraftGone = (error: unknown) =>
  ((error as any)?.response?.status ?? (error as any)?.status) === 404;

/**
 * Why Waldur refused an action on a draft, in its own words. They are
 * written for the requester, so they go without the status line the shared
 * formatter puts first ("409: Conflict. detail: …"); a field error keeps the
 * field's name.
 */
const ticketDraftErrorReason = (error: unknown): string | undefined => {
  const body = getErrorBody(error);
  return body
    ? getMatrixErrorMessage(body, formatErrorObject(body)) || undefined
    : undefined;
};

/** Reports a failed action on a draft, with Waldur's reason when it gave one. */
export const useTicketDraftErrorToast = () => {
  const { showError, showErrorResponse } = useNotify();
  return useCallback(
    (error: unknown, message: string) => {
      const reason = ticketDraftErrorReason(error);
      if (reason) {
        showError(`${message} ${reason}`);
      } else {
        showErrorResponse(error, message);
      }
    },
    [showError, showErrorResponse],
  );
};
