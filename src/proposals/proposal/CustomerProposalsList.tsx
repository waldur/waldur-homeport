import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { proposalProposalsList } from 'waldur-js-client';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { getNonCanceledProposalStates } from '@waldur/proposals/utils';
import { createFetcher } from '@waldur/table/api';
import {
  ProposalsFilter,
  selectProposalsFilter,
  ProposalStatesOptions,
} from '@waldur/table/generated/ProposalsFilter';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { EndingField } from '../EndingField';
import { ProposalExpandableRow } from '../round/proposals/ProposalExpandableRow';

import { ProposalBadge } from './ProposalBadge';
import { ProposalRowActions } from './ProposalRowActions';

export const CustomerProposalsList: FC<{}> = () => {
  const customer = useSelector(getCustomer);
  const formFilters = useSelector(selectProposalsFilter);

  const filter = useMemo(
    () => ({
      organization_uuid: customer?.uuid,
      o: ['-round__cutoff_time'],
      state: getNonCanceledProposalStates(),
      ...formFilters,
    }),
    [customer?.uuid, formFilters],
  );

  const tableProps = useTable({
    table: 'ProposalsList',
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
              state="call-management.proposal-details"
              params={{ proposal_uuid: row.uuid }}
              label={row.name}
            />
          ),
        },
        {
          title: translate('Applicant'),
          render: ({ row }) => <>{renderFieldOrDash(row.created_by_name)} </>,
        },
        {
          title: translate('Call'),
          render: ({ row }) => (
            <Link
              state="protected-call.main"
              params={{ call_uuid: row.call_uuid }}
              label={row.call_name}
            />
          ),

          filter: 'call',
          inlineFilter: (row) => ({ name: row.call_name, uuid: row.call_uuid }),
        },
        {
          title: translate('Round'),
          render: ({ row }) => <>{renderFieldOrDash(row.round.name)}</>,
          orderField: 'round__cutoff_time',
        },
        {
          title: translate('Ending'),
          render: ({ row }) => (
            <EndingField
              endDate={row.round?.cutoff_time}
              hasFixedDuration={Boolean(row.duration_in_days)}
            />
          ),
          className: 'text-nowrap',
        },
        {
          title: translate('State'),
          render: ({ row }) => <ProposalBadge state={row.state} />,
          filter: 'state',
          inlineFilter: (row) =>
            ProposalStatesOptions.filter((s) => s.value === row.state),
        },
      ]}
      title={translate('Proposals')}
      verboseName={translate('Proposals')}
      hasQuery={true}
      filters={<ProposalsFilter />}
      rowActions={({ row }) => (
        <ProposalRowActions refetch={tableProps.fetch} row={row} />
      )}
      expandableRow={ProposalExpandableRow}
    />
  );
};
