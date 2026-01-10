import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import {
  proposalProposalsList,
  ProposalProposalsListData,
} from 'waldur-js-client';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import {
  getNonCanceledProposalStates,
  getProposalStateOptions,
} from '@waldur/proposals/utils';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

import { PROPOSALS_FILTER_FORM_ID } from '../constants';
import { EndingField } from '../EndingField';
import { ProposalExpandableRow } from '../round/proposals/ProposalExpandableRow';

import { AdminProposalsTableFilter } from './AdminProposalsTableFilter';
import { ProposalBadge } from './ProposalBadge';
import { ProposalRowActions } from './ProposalRowActions';

const filtersSelector = createSelector(
  getFormValues(PROPOSALS_FILTER_FORM_ID),
  (filters: any) => {
    const result: ProposalProposalsListData['query'] & { round_uuid?: string } =
      {};
    result.o = ['-round__cutoff_time'];
    result.state = getNonCanceledProposalStates();

    if (filters) {
      if (filters.state) {
        result.state = filters.state.map((option) => option.value);
      }
      if (filters.call) {
        result.call_uuid = filters.call.uuid;
      }
      if (filters.round) {
        result.round_uuid = filters.round.uuid;
      }
      if (filters.organization) {
        result.organization_uuid = filters.organization.uuid;
      }
    }
    return result;
  },
);

export const AdminProposalsList: FC = () => {
  const filterValues = useSelector(filtersSelector);
  const filter = useMemo(() => filterValues, [JSON.stringify(filterValues)]);

  const tableProps = useTable({
    table: 'AdminProposalsList',
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
              params={{ proposal_uuid: row.uuid }}
              label={row.name}
            />
          ),
          keys: ['name'],
          id: 'name',
        },
        {
          title: translate('Applicant'),
          render: ({ row }) => <>{row.created_by_name || '-'}</>,
          keys: ['created_by_name'],
          id: 'applicant',
        },
        {
          title: translate('Organization'),
          render: ({ row }) => (
            <>{renderFieldOrDash((row as any).organization_name)}</>
          ),
          filter: 'organization',
          inlineFilter: (row) => ({
            name: (row as any).organization_name,
            uuid: (row as any).organization_uuid,
          }),
          keys: ['organization_name'] as any,
          id: 'organization',
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
          inlineFilter: (row) => ({
            name: row.call_name,
            uuid: row.call_uuid,
          }),
          keys: ['call_name'],
          id: 'call',
        },
        {
          title: translate('Round'),
          render: ({ row }) => <>{renderFieldOrDash(row.round?.name)}</>,
          orderField: 'round__cutoff_time',
          keys: ['round'],
          id: 'round',
          filter: 'round',
          inlineFilter: (row) => ({
            name: row.round?.name,
            uuid: row.round?.uuid,
          }),
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
          keys: ['round', 'duration_in_days'],
          id: 'ending',
        },
        {
          title: translate('State'),
          render: ({ row }) => <ProposalBadge state={row.state} />,
          filter: 'state',
          inlineFilter: (row) =>
            getProposalStateOptions().filter((s) => s.value === row.state),
          keys: ['state'],
          id: 'state',
        },
      ]}
      title={translate('All proposals')}
      verboseName={translate('Proposals')}
      hasQuery={true}
      filters={<AdminProposalsTableFilter />}
      rowActions={({ row }) => (
        <ProposalRowActions refetch={tableProps.fetch} row={row} />
      )}
      expandableRow={ProposalExpandableRow}
      showPageSizeSelector={true}
      hasOptionalColumns
    />
  );
};
