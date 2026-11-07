import { useQuery } from '@tanstack/react-query';
import { ProposalRun, proposalProposalsRunsList } from 'waldur-js-client';

const isForbidden = (error: any) =>
  error?.response?.status === 403 || error?.status === 403;

export const proposalRunsKey = (proposalUuid: string) =>
  ['proposalRuns', proposalUuid] as const;

/**
 * The accepted proposal's extension requests and final report. A viewer the
 * backend refuses -- a reviewer, a panel member -- gets null: the runs are
 * not theirs to see, which is no error.
 */
export const useProposalRuns = (proposalUuid: string, enabled: boolean) =>
  useQuery({
    queryKey: proposalRunsKey(proposalUuid),
    queryFn: (): Promise<ProposalRun[] | null> =>
      proposalProposalsRunsList({ path: { uuid: proposalUuid } })
        .then((response) => response.data ?? [])
        .catch((error) => {
          if (isForbidden(error)) {
            return null;
          }
          throw error;
        }),
    enabled: Boolean(proposalUuid) && enabled,
  });
