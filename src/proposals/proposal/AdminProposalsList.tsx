import { FC, useMemo } from 'react';
import {
  proposalProposalsList,
  ProposalProposalsListData,
} from 'waldur-js-client';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import {
  getNonCanceledProposalStates,
  getProposalStateOptions,
} from '@/proposals/utils';
import { createFetcher } from '@/table/api';
import {
  ProposalProposalsFilter,
  selectProposalProposalsFilter,
  ProposalProposalsFilterFormId,
} from '@/table/generated/ProposalProposalsFilter';
import Table from '@/table/Table';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { EndingField } from '../EndingField';
import { ProposalExpandableRow } from '../round/proposals/ProposalExpandableRow';

import { ProposalBadge } from './ProposalBadge';
import { ProposalRowActions } from './ProposalRowActions';

export const AdminProposalsList: FC<any> = ({ ...props }) => {
  const values = useFilterValues('AdminProposalsList');
  const filterValues = useMemo(
    () => selectProposalProposalsFilter(values),
    [values],
  );

  const filter = useMemo(() => {
    const result: ProposalProposalsListData['query'] & { round_uuid?: string } =
      {
        ...filterValues,
      };
    result.o = ['-round__cutoff_time'];
    if (!result.state) {
      result.state = getNonCanceledProposalStates();
    }
    return result;
  }, [filterValues]);

  const tableProps = useTable({
    table: 'AdminProposalsList',
    syncFiltersToURL: true,
    fetchData: createFetcher(proposalProposalsList),
    queryField: 'name',
    filter,
  });

  return (
    <Table
      {...tableProps}
      formId={ProposalProposalsFilterFormId}
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
          render: ({ row }) => <>{renderFieldOrDash(row.created_by_name)}</>,
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
          inlineFilter: (row) => ({ name: row.call_name, uuid: row.call_uuid }),
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
      standalone
      hasQuery={true}
      filters={<ProposalProposalsFilter />}
      rowActions={({ row }) => (
        <ProposalRowActions refetch={tableProps.fetch} row={row} />
      )}
      expandableRow={ProposalExpandableRow}
      showPageSizeSelector={true}
      hasOptionalColumns
      {...props}
    />
  );
};
