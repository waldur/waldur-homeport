import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { conflictsOfInterestList, ConflictOfInterest } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { formatDate } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { Call } from '@/proposals/types';
import { PoolSummaryButton } from '@/proposals/update/reviewer-pool/PoolSummaryButton';
import { useReviewerPoolTabs } from '@/proposals/update/reviewer-pool/tabs';
import { createFetcher } from '@/table/api';
import {
  ConflictsOfInterestFilter,
  CoiSeverityLevelOptions,
  ConflictOfInterestStatusOptions,
  CoiTypeOptions,
  selectConflictsOfInterestFilter,
} from '@/table/generated/ConflictsOfInterestFilter';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { COIExpandableRow } from './COIExpandableRow';
import { COIRowActions } from './COIRowActions';

interface COIReviewSectionProps {
  call: Call;
  refetch: () => void;
}

const SeverityBadge: FC<{ severity: string; display: string }> = ({
  severity,
  display,
}) => {
  const variant = useMemo(() => {
    switch (severity) {
      case 'real':
        return 'danger';
      case 'apparent':
        return 'warning';
      case 'potential':
        return 'info';
      default:
        return 'secondary';
    }
  }, [severity]);

  return (
    <Badge variant={variant} pill outline>
      {display}
    </Badge>
  );
};

const StatusBadge: FC<{ status: string; display: string }> = ({
  status,
  display,
}) => {
  const variant = useMemo(() => {
    switch (status) {
      case 'confirmed':
        return 'danger';
      case 'dismissed':
        return 'secondary';
      case 'waived':
        return 'warning';
      case 'recused':
        return 'info';
      case 'pending':
      default:
        return 'primary';
    }
  }, [status]);

  return (
    <Badge variant={variant} pill outline>
      {display}
    </Badge>
  );
};

export const COIReviewSection: FC<COIReviewSectionProps> = ({ call }) => {
  const formFilters = useSelector(selectConflictsOfInterestFilter);
  const tabs = useReviewerPoolTabs();

  const filter = useMemo(
    () => ({
      call_uuid: call.uuid,
      ...formFilters,
    }),
    [call.uuid, formFilters],
  );

  const tableProps = useTable({
    table: 'COIReviewTable',
    fetchData: createFetcher(conflictsOfInterestList),
    filter,
  });

  const columns = useMemo(
    () => [
      {
        title: translate('Reviewer'),
        render: ({ row }: { row: ConflictOfInterest }) => (
          <span className="fw-bold">{row.reviewer_name}</span>
        ),
        id: 'reviewer',
        keys: ['reviewer_name'],
      },
      {
        title: translate('Proposal'),
        render: ({ row }: { row: ConflictOfInterest }) => (
          <Link
            state="call-management.proposal-details"
            params={{ uuid: row.call_uuid, proposal_uuid: row.proposal_uuid }}
            label={row.proposal_name}
          />
        ),
        id: 'proposal',
        keys: ['proposal_name', 'proposal_uuid', 'call_uuid'],
      },
      {
        title: translate('Round'),
        render: ({ row }: { row: ConflictOfInterest }) => (
          <span>{row.round_name}</span>
        ),
        id: 'round',
        keys: ['round_name', 'round_uuid'],
        filter: 'round',
        inlineFilter: (row: ConflictOfInterest) => ({
          name: row.round_name,
          uuid: row.round_uuid,
        }),
        optional: true,
      },
      {
        title: translate('COI type'),
        render: ({ row }: { row: ConflictOfInterest }) => (
          <span>{row.coi_type_display}</span>
        ),
        id: 'coi_type',
        keys: ['coi_type', 'coi_type_display'],
        filter: 'coi_type',
        inlineFilter: (row: ConflictOfInterest) =>
          CoiTypeOptions.filter((opt) => opt.value === row.coi_type),
      },
      {
        title: translate('Severity'),
        render: ({ row }: { row: ConflictOfInterest }) => (
          <SeverityBadge
            severity={row.severity}
            display={row.severity_display}
          />
        ),
        id: 'severity',
        keys: ['severity', 'severity_display'],
        filter: 'severity',
        inlineFilter: (row: ConflictOfInterest) =>
          CoiSeverityLevelOptions.find((opt) => opt.value === row.severity),
      },
      {
        title: translate('Status'),
        render: ({ row }: { row: ConflictOfInterest }) => (
          <StatusBadge status={row.status} display={row.status_display} />
        ),
        id: 'status',
        keys: ['status', 'status_display'],
        filter: 'status',
        inlineFilter: (row: ConflictOfInterest) =>
          ConflictOfInterestStatusOptions.filter(
            (opt) => opt.value === row.status,
          ),
      },
      {
        title: translate('Detection'),
        render: ({ row }: { row: ConflictOfInterest }) => (
          <span>{row.detection_method}</span>
        ),
        id: 'detection',
        keys: ['detection_method'],
        optional: true,
      },
      {
        title: translate('Detected'),
        render: ({ row }: { row: ConflictOfInterest }) => (
          <span>{formatDate(row.detected_at)}</span>
        ),
        id: 'detected_at',
        keys: ['detected_at'],
      },
    ],
    [],
  );

  return (
    <Table
      {...tableProps}
      columns={columns}
      title={translate('Reviewer pool')}
      tabs={tabs}
      verboseName={translate('conflicts of interest')}
      showPageSizeSelector
      hasQuery
      filters={<ConflictsOfInterestFilter call={call} />}
      rowActions={COIRowActions}
      hasOptionalColumns
      expandableRow={COIExpandableRow}
      tableActions={<PoolSummaryButton />}
    />
  );
};
