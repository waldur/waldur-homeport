import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { proposalProposalsList } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import {
  ProposalProposalsFilter,
  selectProposalProposalsFilter,
  ProposalStatesOptions,
} from '@waldur/table/generated/ProposalProposalsFilter';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

import { EndingField } from '../EndingField';
import { ComplianceStatusBadge } from '../proposal/ComplianceStatusBadge';
import { ProposalBadge } from '../proposal/ProposalBadge';
import { ProposalRowActions } from '../proposal/ProposalRowActions';
import { ProposalExpandableRow } from '../round/proposals/ProposalExpandableRow';
import { Call } from '../types';

interface CallProposalsListProps {
  call: Call;
}

export const CallProposalsList: FC<CallProposalsListProps> = ({ call }) => {
  const formFilters = useSelector(selectProposalProposalsFilter);

  const filter = useMemo(
    () => ({
      call_uuid: call.uuid,
      o: ['-round__cutoff_time'],
      ...formFilters,
    }),
    [call.uuid, formFilters],
  );

  const tableProps = useTable({
    table: `CallProposalsList-${call.uuid}`,
    filter,
    fetchData: createFetcher(proposalProposalsList),
    queryField: 'name',
  });

  const hasComplianceChecklist = Boolean(call.compliance_checklist);

  return (
    <Table
      {...tableProps}
      id="proposals"
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => (
            <Link
              state="call-management.proposal-details"
              params={{
                proposal_uuid: row.uuid,
                uuid: call.customer_uuid,
              }}
              label={row.name}
            />
          ),
          copyField: (row) => row.name,
          keys: ['name', 'uuid'],
          id: 'name',
        },
        {
          title: translate('Applicant'),
          render: ({ row }) => <>{row.created_by_name || '-'}</>,
          keys: ['created_by_name', 'created_by_uuid'],
          id: 'applicant',
          filter: 'applicant',
          inlineFilter: (row) => ({
            full_name: row.created_by_name,
            uuid: row.created_by_uuid,
          }),
        },
        {
          title: translate('Round ID'),
          render: ({ row }) => <>{renderFieldOrDash(row.round?.slug)}</>,
          copyField: (row) => row.round?.slug || '',
          orderField: 'round__cutoff_time',
          keys: ['round'],
          id: 'round',
          filter: 'round',
          inlineFilter: (row) =>
            row.round
              ? {
                  name: row.round.slug,
                  uuid: row.round.uuid,
                }
              : null,
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
          title: translate('Created'),
          render: ({ row }) => <>{formatDateTime(row.created)}</>,
          keys: ['created'],
          id: 'created',
        },
        {
          title: translate('State'),
          render: ({ row }) => <ProposalBadge state={row.state} />,
          keys: ['state'],
          id: 'state',
          filter: 'state',
          inlineFilter: (row) =>
            ProposalStatesOptions.filter((s) => s.value === row.state),
        },
        ...(hasComplianceChecklist
          ? [
              {
                title: translate('Compliance'),
                render: ({ row }) => (
                  <ComplianceStatusBadge status={row.compliance_status} />
                ),
                keys: ['compliance_status'],
                id: 'compliance',
              },
            ]
          : []),
      ]}
      title={translate('Proposals')}
      hasQuery
      verboseName={translate('Proposals')}
      expandableRow={ProposalExpandableRow}
      rowActions={({ row }) => (
        <ProposalRowActions
          row={{
            ...row,
            call_uuid: call.uuid,
          }}
          refetch={tableProps.fetch}
        />
      )}
      filters={<ProposalProposalsFilter callUuid={call.uuid} />}
    />
  );
};
