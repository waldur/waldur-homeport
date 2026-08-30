import { useQuery } from '@tanstack/react-query';
import { proposalProposalsResourcesList } from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';

/**
 * Every requested resource, not the page a table happens to show.
 *
 * The proposal's totals and its derived duration are drawn from all of them, so
 * paging would understate both. Shared by the applicant's submission form and
 * the reviewer's page so the two cannot report different figures for the same
 * proposal.
 */
export const useProposalResourceRows = (proposalUuid: string) =>
  useQuery({
    queryKey: ['ProposalResourcesSummary', proposalUuid],
    queryFn: () =>
      getAllPages((page) =>
        proposalProposalsResourcesList({
          path: { uuid: proposalUuid },
          query: { page, page_size: MAX_PAGE_SIZE } as any,
        }),
      ),
    refetchOnWindowFocus: false,
    enabled: Boolean(proposalUuid),
  });
