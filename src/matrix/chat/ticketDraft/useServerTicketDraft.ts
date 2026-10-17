import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  MatrixTicketDraft,
  matrixTicketDraftsRetrieve,
} from 'waldur-js-client';

import { OWN_ERROR_STATE, retryServerErrors } from '@/core/queryRetry';

import { useMatrixClient } from '../useMatrixClient';

import { TicketDraft, TicketDraftOutcome } from './parseTicketDraft';
import { isTicketDraftGone } from './ticketDraftErrors';

/** The cached draft, per user: switching user must not reuse it. */
export const ticketDraftQueryKey = (
  userId: string | null,
  draftUuid: string,
) => ['MatrixTicketDraft', userId, draftUuid];

const fromServer = (
  event: TicketDraft,
  server: MatrixTicketDraft,
): TicketDraft => ({
  // Where the card is and who asked come from the event; everything the
  // requester reads and acts on comes from Waldur.
  draftUuid: event.draftUuid,
  requester: event.requester,
  title: server.title,
  description: server.description,
  requestType: server.request_type || undefined,
  priority: server.priority || undefined,
  helpdesk: server.helpdesk || undefined,
  project: {
    uuid: server.project_uuid,
    name: server.project_name,
    customerUuid: server.customer_uuid || undefined,
    customerName: server.customer_name || undefined,
  },
  resource: server.resource_uuid
    ? {
        uuid: server.resource_uuid,
        name: server.resource_name,
        offeringName: server.resource_offering_name || undefined,
      }
    : undefined,
  expiresAt: server.expires_at,
});

const outcomeOf = (server: MatrixTicketDraft): TicketDraftOutcome | null => {
  switch (server.state) {
    case 'sent':
      return {
        state: 'created',
        issueUuid: server.issue_uuid ?? undefined,
        issueKey: server.issue_key ?? undefined,
      };
    case 'cancelled':
      return { state: 'cancelled' };
    case 'expired':
      return { state: 'expired' };
    default:
      return null;
  }
};

/**
 * The requester's own view of a draft, as Waldur holds it. The room event is
 * whatever its sender wrote, so a requester never acts on it: a card whose
 * draft Waldur doesn't give them (someone else's, forged, sent or expired)
 * has no actions.
 */
export function useServerTicketDraft(
  event: TicketDraft,
  isRequester: boolean,
  /** What the bot already reported; a closed draft needs no fetch. */
  timelineOutcome: TicketDraftOutcome | undefined,
) {
  const { userId } = useMatrixClient();
  const enabled = isRequester && !timelineOutcome;
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ticketDraftQueryKey(userId, event.draftUuid),
    queryFn: () =>
      matrixTicketDraftsRetrieve({ path: { uuid: event.draftUuid } }).then(
        ({ data }) => data,
      ),
    enabled,
    // A 404 is an answer here (not this user's draft, or no longer open),
    // not a page that isn't found.
    meta: OWN_ERROR_STATE,
    retry: retryServerErrors(2),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
  // A failed refetch keeps the last data, so a 404 must win over a draft
  // that was pending when last asked.
  const gone = isTicketDraftGone(error);
  // Only a pending draft can be acted on; Waldur erases the text of the
  // others, so they keep the event's text and show what became of them.
  const draft = useMemo(
    () => (data?.state === 'pending' && !gone ? fromServer(event, data) : null),
    [event, data, gone],
  );
  // A 404 is an answer; anything else is worth another try.
  const failed = !!error && !gone;
  return {
    draft,
    outcome: data ? outcomeOf(data) : null,
    // Another try keeps the error until it is answered: without this, a
    // click on Reload would show nothing through the retries.
    loading: enabled && (isLoading || (failed && isFetching)),
    failed,
    retry: refetch,
  };
}
