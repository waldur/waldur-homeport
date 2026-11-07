import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import {
  proposalProposalsList,
  proposalPublicCallsList,
  PublicCall,
} from 'waldur-js-client';

import { getAllPages } from '@/core/api';
import { formatDate } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { ProposalStateBadge } from '@/proposals/proposal/ProposalStateBadge';
import { RoundRankingTable } from '@/proposals/round/ranking/RoundRankingTable';
import { createFetcher } from '@/table/api';
import { EmbeddedTabs } from '@/table/EmbeddedTabs';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useCustomer } from '@/workspace/hooks';

/** A round's results are out once they are published, and stay out after it
 * closes; before that nothing of it is read here. */
const PUBLISHED_STATES = ['results_published', 'closed'];

type PublishedRound = PublicCall['rounds'][number] & {
  call_uuid: string;
  call_name: string;
};

/** Every round of the calls whose results are out, with its call. */
export const getPublishedRounds = (
  calls: Pick<PublicCall, 'uuid' | 'name' | 'rounds'>[],
): PublishedRound[] =>
  calls.flatMap((call) =>
    (call.rounds ?? [])
      .filter((round) => PUBLISHED_STATES.includes(round.lifecycle_state))
      .map((round) => ({
        ...round,
        call_uuid: call.uuid,
        call_name: call.name,
      })),
  );

const RoundProposals: FC<{ round: PublishedRound }> = ({ round }) => {
  const customer = useCustomer();
  const filter = useMemo(() => ({ round_uuid: round.uuid }), [round.uuid]);
  const tableProps = useTable({
    table: `CallResultsProposals-${round.uuid}`,
    fetchData: createFetcher(proposalProposalsList),
    queryField: 'name',
    filter,
  });
  return (
    <Table
      {...tableProps}
      columns={[
        {
          title: translate('Proposal'),
          render: ({ row }) => (
            <Link
              state="proposals.manage-proposal"
              // Tells the proposal page the way back here.
              params={{ proposal_uuid: row.uuid, results: customer?.uuid }}
              label={row.name}
            />
          ),
        },
        {
          title: translate('Applicant'),
          render: ({ row }) => <>{renderFieldOrDash(row.created_by_name)}</>,
        },
        {
          title: translate('State'),
          render: ({ row }) => <ProposalStateBadge row={row} />,
        },
      ]}
      verboseName={translate('proposals')}
      hideTitle
      hasActionBar={false}
      placeholderHasRetry={false}
    />
  );
};

const RoundResults: FC<{ row: PublishedRound }> = ({ row }) => (
  <EmbeddedTabs
    framed
    tabs={[
      {
        key: 'ranking',
        title: translate('Ranking'),
        content: <RoundRankingTable round={row} canEdit={false} />,
      },
      {
        key: 'proposals',
        title: translate('Proposals'),
        content: <RoundProposals round={row} />,
      },
    ]}
  />
);

/**
 * The published results of the calls an organisation runs: each round whose
 * results are out, with its ranking and its proposals, read-only. For whoever
 * holds CALL.VIEW_RESULTS on the organisation -- the backend shows them
 * nothing of a round before its results are published.
 */
export const CallResultsPage: FC = () => {
  const customer = useCustomer();
  const { data: calls, isLoading } = useQuery({
    queryKey: ['call-results-calls', customer?.uuid],
    queryFn: () =>
      getAllPages((page) =>
        proposalPublicCallsList({
          query: { customer_uuid: customer.uuid, page },
        }),
      ),
    enabled: Boolean(customer?.uuid),
  });

  const rounds = useMemo(() => getPublishedRounds(calls ?? []), [calls]);

  const tableProps = useTable<PublishedRound>({
    table: `CallResultsRounds-${customer?.uuid}`,
    fetchData: () =>
      Promise.resolve({ rows: rounds, resultCount: rounds.length }),
    filter: rounds,
  });

  return (
    <Table
      {...tableProps}
      // A short list, shown whole.
      hasPagination={false}
      loading={isLoading || tableProps.loading}
      title={translate('Call results')}
      verboseName={translate('rounds with published results')}
      columns={[
        {
          title: translate('Call'),
          render: ({ row }) => <>{row.call_name}</>,
        },
        {
          title: translate('Round'),
          render: ({ row }) => <>{row.name}</>,
        },
        {
          title: translate('Results published'),
          render: ({ row }) => (
            <>{renderFieldOrDash(formatDate(row.results_published_at))}</>
          ),
        },
      ]}
      expandableRow={RoundResults}
      hasActionBar={false}
    />
  );
};
