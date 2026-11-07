import { useQuery } from '@tanstack/react-query';
import { FC, useCallback } from 'react';
import {
  ProposalBudget,
  ProposalBudgetEntry,
  proposalProposalsBudgetRetrieve,
} from 'waldur-js-client';

import { Badge } from 'waldur-ui';

import { translate } from '@/i18n';
import { formatBudgetAmount, proposalBudgetKey } from '@/proposals/budgets';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

/**
 * The resource pools the proposal's award draws on -- the call-wide ones
 * and its round's: offered, awarded to the other proposals, what remains
 * and whether this award fits. The call team's
 * only: anyone else is refused, and the query then shows nothing.
 */
export const useProposalBudget = (proposalUuid: string, enabled: boolean) =>
  useQuery({
    queryKey: proposalBudgetKey(proposalUuid),
    queryFn: () =>
      proposalProposalsBudgetRetrieve({ path: { uuid: proposalUuid } }).then(
        (response) => response.data,
      ),
    enabled,
    retry: false,
    meta: { skipGlobalErrorRedirect: true },
  });

const columns: Column<ProposalBudgetEntry>[] = [
  {
    title: translate('Pool'),
    render: ({ row }) => (
      <span className="font-medium text-primary">
        {`${row.offering_name} / ${row.component_type} (${
          row.round_name || translate('whole call')
        })`}
      </span>
    ),
  },
  {
    title: translate('Offered'),
    render: ({ row }) => formatBudgetAmount(row.offered_total),
  },
  {
    title: translate('Awarded to others'),
    render: ({ row }) => row.awarded_so_far.toLocaleString(),
  },
  {
    title: translate('Remaining'),
    render: ({ row }) => formatBudgetAmount(row.remaining),
  },
  {
    title: translate('This award'),
    render: ({ row }) => renderFieldOrDash(row.award),
  },
  {
    title: translate('Fits'),
    render: ({ row }) =>
      row.fits ? (
        <Badge variant="success" tone="outline">
          {translate('Yes')}
        </Badge>
      ) : (
        <Badge variant="danger" tone="outline">
          {translate('No')}
        </Badge>
      ),
  },
];

export const ProposalBudgetTable: FC<{
  proposalUuid: string;
  budget: ProposalBudget;
}> = ({ proposalUuid, budget }) => {
  const fetchData = useCallback(
    () =>
      Promise.resolve({
        rows: budget.entries,
        resultCount: budget.entries.length,
      }),
    [budget],
  );
  const tableProps = useTable({
    table: `ProposalBudget-${proposalUuid}`,
    fetchData,
  });
  return (
    <Table<ProposalBudgetEntry>
      {...tableProps}
      columns={columns}
      verboseName={translate('resource pools')}
      hideTitle
      hasActionBar={false}
      placeholderHasRetry={false}
    />
  );
};
