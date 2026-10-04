import { QueryClient, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
  ProposalCanSubmitResponse,
  proposalProposalsRetrieve,
} from 'waldur-js-client';

const canSubmitQueryKey = (proposalUuid: string) => [
  'ProposalCanSubmit',
  proposalUuid,
];

/**
 * The backend's verdict on submitting, kept apart from the proposal itself.
 *
 * It depends on the requested resources, which change without the proposal
 * being reloaded, so the verdict is reloaded on its own instead of refetching
 * the whole proposal. Seeded from the proposal the page loaded and not cached
 * past the page.
 */
export const useProposalCanSubmit = (proposal: {
  uuid: string;
  can_submit?: ProposalCanSubmitResponse;
}) => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: canSubmitQueryKey(proposal.uuid),
    queryFn: () =>
      proposalProposalsRetrieve({ path: { uuid: proposal.uuid } }).then(
        (response) => response.data.can_submit,
      ),
    initialData: proposal.can_submit,
    staleTime: Infinity,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });

  // A revisit renders the cached proposal first and refetches it in the
  // background. initialData only seeds a new entry, so follow the proposal
  // whenever it brings a different verdict.
  useEffect(() => {
    if (proposal.can_submit) {
      queryClient.setQueryData(
        canSubmitQueryKey(proposal.uuid),
        proposal.can_submit,
      );
    }
  }, [queryClient, proposal.uuid, proposal.can_submit]);

  return query;
};

/** Call wherever the requested resources have just changed. */
export const invalidateProposalCanSubmit = (
  queryClient: QueryClient,
  proposalUuid: string,
) =>
  queryClient.invalidateQueries({
    queryKey: canSubmitQueryKey(proposalUuid),
  });
