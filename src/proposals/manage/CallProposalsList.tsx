import { FC, useMemo } from 'react';
import { proposalProposalsList } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { downloadFile } from '@/form/upload/FileDownloader';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import {
  ProposalProposalsFilter,
  selectProposalProposalsFilter,
  ProposalStatesOptions,
  ProposalProposalsFilterFormId,
} from '@/table/generated/ProposalProposalsFilter';
import Table from '@/table/Table';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useUser } from '@/workspace/hooks';

import {
  ComplianceStatusBadge,
  formatComplianceStatus,
} from '../proposal/ComplianceStatusBadge';
import { ProposalBadge } from '../proposal/ProposalBadge';
import { ProposalRowActions } from '../proposal/ProposalRowActions';
import { ProposalExpandableRow } from '../round/proposals/ProposalExpandableRow';
import { Call } from '../types';
import { canExportCall } from '../utils';

import { buildCallExportUrl } from './callExportUrl';
import { ProposalStepCell } from './ProposalStepCell';

interface CallProposalsListProps {
  call: Call;
}

export const CallProposalsList: FC<CallProposalsListProps> = ({ call }) => {
  const values = useFilterValues(`CallProposalsList-${call.uuid}`);

  const formFilters = useMemo(
    () => selectProposalProposalsFilter(values),
    [values],
  );

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
    syncFiltersToURL: true,
    filter,
    fetchData: createFetcher(proposalProposalsList),
    queryField: 'name',
  });

  const hasComplianceChecklist = Boolean(call.compliance_checklist);
  const user = useUser();
  const canExport = canExportCall(user, call);

  // Written by the server: it holds a column per requested offering component
  // and the review scores, none of which are columns in this table.
  const fullExport = useMemo(
    () => ({
      label: translate('Full report'),
      description: translate(
        'Every field, including the amount requested per offering component and the review scores.',
      ),
      download: ({ withFilters, query }) =>
        downloadFile(
          buildCallExportUrl(
            call,
            'export-proposals',
            'proposal_state',
            withFilters ? formFilters : undefined,
            query,
          ),
          `${call.slug || call.uuid}-proposals.csv`,
        ),
    }),
    [call, formFilters],
  );

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
          render: ({ row }) => <>{renderFieldOrDash(row.created_by_name)}</>,
          keys: ['created_by_name', 'created_by_uuid'],
          id: 'applicant',
          filter: 'applicant',
          inlineFilter: (row) => ({
            full_name: row.created_by_name,
            uuid: row.created_by_uuid,
          }),
        },
        {
          // The queue's reason for existing: which proposals are waiting on
          // this manager rather than on a reviewer or the applicant.
          title: translate('Step'),
          render: ({ row }) => (
            <ProposalStepCell callUuid={call.uuid} step={row.workflow_step} />
          ),
          keys: ['workflow_step'],
          id: 'step',
        },
        // Round ID and Ending are properties of the round, identical on every
        // row inside one call, and between them they took the width that left
        // State clipped. They stay on the cross-call lists, where they vary.
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
                export: (row) => formatComplianceStatus(row.compliance_status),
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
      formId={ProposalProposalsFilterFormId}
      enableExport
      fullExport={canExport ? fullExport : undefined}
    />
  );
};
