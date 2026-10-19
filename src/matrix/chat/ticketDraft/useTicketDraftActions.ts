import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import {
  matrixTicketDraftsCancel,
  matrixTicketDraftsCreateIssue,
  MatrixTicketDraftIssue,
} from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { ISSUE_CREATION_FORM_ID } from '@/issues/create/constants';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { ROOM_COMMANDS_QUERY_KEY } from '../commands/queryKeys';
import { useMatrixClient } from '../useMatrixClient';

import { TicketDraft, TicketDraftOutcome } from './parseTicketDraft';
import {
  isTicketDraftGone,
  useTicketDraftErrorToast,
} from './ticketDraftErrors';
import { ticketDraftQueryKey } from './useServerTicketDraft';

const TicketDraftEditDialog = lazyComponent(() =>
  import('./TicketDraftEditDialog').then((module) => ({
    default: module.TicketDraftEditDialog,
  })),
);

export type TicketDraftState = { state: 'pending' } | TicketDraftOutcome;

const fromCreated = (issue: MatrixTicketDraftIssue): TicketDraftOutcome => ({
  state: 'created',
  issueUuid: issue.issue_uuid,
  issueKey: issue.issue_key,
});

// A longer delay makes setTimeout fire at once.
const MAX_TIMEOUT_MS = 2 ** 31 - 1;

const useExpired = (expiresAt: string | undefined) => {
  const [expired, setExpired] = useState(
    () => !!expiresAt && Date.parse(expiresAt) <= Date.now(),
  );
  useEffect(() => {
    if (!expiresAt) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    // Re-render when the draft expires, so its buttons go away on time; a
    // TTL of weeks is waited for in steps.
    const wait = () => {
      const delay = Date.parse(expiresAt) - Date.now();
      if (delay <= 0) {
        setExpired(true);
        return;
      }
      timer = setTimeout(wait, Math.min(delay, MAX_TIMEOUT_MS));
    };
    wait();
    return () => clearTimeout(timer);
  }, [expiresAt]);
  return expired;
};

/**
 * State of a ticket draft card and the requester's actions on it. What became
 * of the draft comes from the bot's follow-up in the timeline, or from the
 * requester's own action until that follow-up arrives.
 */
export function useTicketDraftActions(
  draft: TicketDraft,
  timelineOutcome: TicketDraftOutcome | undefined,
) {
  const { openDialog } = useModal();
  const { userId } = useMatrixClient();
  const queryClient = useQueryClient();
  const [localOutcome, setLocalOutcome] = useState<TicketDraftOutcome>();
  // Waldur refused the draft as gone. Asked again, it can still list it as
  // pending (a requester who lost access to the room), so the refusal stands.
  const [gone, setGone] = useState(false);
  const expired = useExpired(draft.expiresAt);
  const showFailure = useTicketDraftErrorToast();

  // A closed draft takes `ticket send` and `ticket cancel` off the
  // composer. Not awaited: the card need not wait for the composer.
  const closed = useCallback(
    (outcome: TicketDraftOutcome) => {
      setLocalOutcome(outcome);
      queryClient.invalidateQueries({ queryKey: ROOM_COMMANDS_QUERY_KEY });
    },
    [queryClient],
  );

  // Whatever refused the action may have changed the draft, so Waldur is
  // asked again.
  const failed = useCallback(
    (error: unknown) => {
      if (isTicketDraftGone(error)) setGone(true);
      queryClient.invalidateQueries({
        queryKey: ticketDraftQueryKey(userId, draft.draftUuid),
      });
    },
    [queryClient, userId, draft.draftUuid],
  );

  const { mutate, isPending: creating } = useManagedMutation({
    mutationFn: () =>
      matrixTicketDraftsCreateIssue({
        path: { uuid: draft.draftUuid },
        body: {},
      }).then(({ data }) => data),
    onSuccess: (issue) => closed(fromCreated(issue)),
    // Waldur now reports the draft as sent, with its issue.
    invalidateQueries: [
      { queryKey: ticketDraftQueryKey(userId, draft.draftUuid) },
    ],
    successMessage: translate('Support ticket created.'),
    onError: (error) => {
      showFailure(error, translate('Unable to create the support ticket.'));
      failed(error);
    },
    // The card is not in a modal; leave any open dialog alone.
    closeModal: false,
  });

  const create = useCallback(() => mutate(undefined), [mutate]);

  // No confirmation: a new draft is one `!ticket` away.
  const { mutate: mutateCancel, isPending: cancelling } = useManagedMutation({
    mutationFn: () =>
      matrixTicketDraftsCancel({ path: { uuid: draft.draftUuid } }),
    onSuccess: () => closed({ state: 'cancelled' }),
    invalidateQueries: [
      { queryKey: ticketDraftQueryKey(userId, draft.draftUuid) },
    ],
    onError: (error) => {
      showFailure(error, translate('Unable to cancel the ticket draft.'));
      failed(error);
    },
    closeModal: false,
  });

  const cancel = useCallback(() => mutateCancel(undefined), [mutateCancel]);

  const edit = useCallback(() => {
    openDialog(TicketDraftEditDialog, {
      resolve: {
        draft,
        onCreated: (issue: MatrixTicketDraftIssue) => {
          closed(fromCreated(issue));
          queryClient.invalidateQueries({
            queryKey: ticketDraftQueryKey(userId, draft.draftUuid),
          });
        },
        onFailed: failed,
      },
      dialogClassName: 'sm:max-w-[650px]',
      formId: ISSUE_CREATION_FORM_ID,
    });
  }, [openDialog, draft, queryClient, userId, closed, failed]);

  const state: TicketDraftState = timelineOutcome ??
    localOutcome ?? { state: expired ? 'expired' : 'pending' };

  return { state, create, edit, cancel, creating, cancelling, gone };
}
