import { useQuery } from '@tanstack/react-query';
import {
  ProposalReviewerSuggestion,
  proposalProposalsMyReviewerSuggestionsList,
  proposalProposalsSuggestedReviewersList,
  SuggestedReviewer,
} from 'waldur-js-client';

import { OWN_ERROR_STATE } from '@/core/queryRetry';

const REVIEWER_SUGGESTIONS_KEY = 'proposalReviewerSuggestions';

/** The viewer may not read the suggestions: an expected answer, not a failure. */
export const isRefused = (error: any) =>
  (error?.status ?? error?.response?.status) === 403;

export const myReviewerSuggestionsKey = (proposalUuid: string) =>
  [REVIEWER_SUGGESTIONS_KEY, 'mine', proposalUuid] as const;

export const suggestedReviewersKey = (proposalUuid: string) =>
  [REVIEWER_SUGGESTIONS_KEY, 'all', proposalUuid] as const;

/** The reviewers the viewer suggested for the proposal. */
export const useMyReviewerSuggestions = (
  proposalUuid: string,
  enabled: boolean,
) =>
  useQuery<ProposalReviewerSuggestion[]>({
    queryKey: myReviewerSuggestionsKey(proposalUuid),
    queryFn: () =>
      proposalProposalsMyReviewerSuggestionsList({
        path: { uuid: proposalUuid },
      }).then((response) => response.data ?? []),
    enabled,
    refetchOnWindowFocus: false,
    retry: false,
    meta: OWN_ERROR_STATE,
  });

/**
 * Every reviewer suggested for the proposal, merged per person. Readable by
 * the call's managers and the completer of the step collecting them only;
 * anyone else is refused, which must not take them off the page.
 */
export const useSuggestedReviewers = (proposalUuid: string, enabled: boolean) =>
  useQuery<SuggestedReviewer[]>({
    queryKey: suggestedReviewersKey(proposalUuid),
    queryFn: () =>
      proposalProposalsSuggestedReviewersList({
        path: { uuid: proposalUuid },
      }).then((response) => response.data ?? []),
    enabled,
    refetchOnWindowFocus: false,
    retry: false,
    meta: OWN_ERROR_STATE,
  });

interface LoadedSuggestions {
  data?: unknown[];
  isError: boolean;
  error: unknown;
}

/**
 * Whether the viewer's own suggestions are on the page: those they made, or
 * a place to make some. A refusal shows nothing; another failure is shown.
 */
export const showsMyReviewerSuggestions = (
  { data, isError, error }: LoadedSuggestions,
  canSuggest: boolean,
) => (isError ? !isRefused(error) : canSuggest || Boolean(data?.length));

/**
 * Whether every suggestion is on the page for a viewer meant to read them:
 * unless the backend refuses them after all. An empty list is shown, empty.
 */
export const showsSuggestedReviewers = ({
  isError,
  error,
}: LoadedSuggestions) => !(isError && isRefused(error));
