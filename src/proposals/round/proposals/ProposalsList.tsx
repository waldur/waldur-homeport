import { FC, useMemo } from 'react';
import { proposalProposalsList, ProtectedRound } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { ComplianceStatusBadge } from '@waldur/proposals/proposal/ComplianceStatusBadge';
import { ProposalBadge } from '@waldur/proposals/proposal/ProposalBadge';
import { Call } from '@waldur/proposals/types';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { ProposalRowActions } from '../../proposal/ProposalRowActions';

import { ProposalExpandableRow } from './ProposalExpandableRow';

interface RoundProposalsListProps {
  round: ProtectedRound;
  call: Call;
}

export const ProposalsList: FC<RoundProposalsListProps> = (props) => {
  const filter = useMemo(
    () => ({ round: props.round.uuid }),
    [props.round.uuid],
  );
  const tableProps = useTable({
    table: 'RoundProposalsList',
    filter,
    fetchData: createFetcher(proposalProposalsList),
    queryField: 'name',
  });

  // Check if call has compliance checklist configured
  const hasComplianceChecklist = Boolean(props.call?.compliance_checklist);

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
                uuid: props.call.customer_uuid,
              }}
              label={row.name}
            />
          ),

          copyField: (row) => row.name,
        },
        {
          title: translate('By'),
          render: ({ row }) => <>{row.created_by_name || '-'} </>,
        },
        {
          title: translate('Created'),
          render: ({ row }) => <>{formatDateTime(row.created)}</>,
        },
        {
          title: translate('State'),
          render: ({ row }) => <ProposalBadge state={row.state} />,
        },
        // Conditionally add compliance column if call has compliance checklist
        ...(hasComplianceChecklist
          ? [
              {
                title: translate('Compliance'),
                render: ({ row }) => (
                  <ComplianceStatusBadge status={row.compliance_status} />
                ),
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
            call_uuid: props.call.uuid,
          }}
          refetch={tableProps.fetch}
        />
      )}
    />
  );
};
