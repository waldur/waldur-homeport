import { InviteSuggestedReviewersResponse } from 'waldur-js-client';

import { translate } from '@/i18n';

type BadgeVariant = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

/** Where a suggested reviewer stands; past the call manager, their invitation. */
export const suggestionStatusLabel = (status: string): string =>
  ({
    pending: translate('Suggested'),
    invited: translate('Invited'),
    accepted: translate('Accepted'),
    declined: translate('Declined'),
    expired: translate('Invitation expired'),
    discarded: translate('Discarded'),
  })[status] ?? status;

export const suggestionStatusVariant = (status: string): BadgeVariant =>
  (
    ({
      pending: 'neutral',
      invited: 'info',
      accepted: 'success',
      declined: 'danger',
      expired: 'warning',
      discarded: 'neutral',
    }) as Record<string, BadgeVariant>
  )[status] ?? 'neutral';

/** Where the latest assignment of a suggested reviewer stands. */
export const assignmentBatchStatusLabel = (status: string): string =>
  ({
    draft: translate('draft, not sent yet'),
    sent: translate('sent to the reviewer'),
    responded: translate('the reviewer responded'),
    expired: translate('expired'),
    cancelled: translate('canceled'),
  })[status] ?? status;

const personOf = (
  result: InviteSuggestedReviewersResponse['results'][number],
): string =>
  result.candidate.suggested_user_name ||
  result.candidate.email ||
  translate('Unknown');

export interface InvitationSummary {
  /** success: everyone was acted on; warning: some were not; error: none. */
  level: 'success' | 'warning' | 'error';
  message: string;
}

/**
 * What inviting suggested reviewers came to, as told to the call manager:
 * how many were invited, sent their expired invitation again or linked to
 * the pool entry they had, and why each of the others was not invited.
 */
export const invitationSummary = (
  response: InviteSuggestedReviewersResponse,
): InvitationSummary => {
  const parts: string[] = [];
  if (response.invited) {
    parts.push(
      translate('{count} invited to the reviewer pool.', {
        count: response.invited,
      }),
    );
  }
  if (response.resent) {
    parts.push(
      translate('{count} expired invitation(s) sent again.', {
        count: response.resent,
      }),
    );
  }
  if (response.linked) {
    parts.push(
      translate('{count} linked to their existing reviewer pool entry.', {
        count: response.linked,
      }),
    );
  }
  const refused = response.results.filter(
    (result) => result.outcome === 'refused',
  );
  for (const result of refused) {
    parts.push(
      translate('Not invited: {person}: {reason}', {
        person: personOf(result),
        reason: result.detail,
      }),
    );
  }
  const actedOn = response.results.length - refused.length;
  return {
    level: !refused.length ? 'success' : actedOn ? 'warning' : 'error',
    message: parts.join(' '),
  };
};
