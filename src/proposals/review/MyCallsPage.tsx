import { FC, useMemo } from 'react';
import { CallReviewerPool, callReviewerPoolsList } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { formatDate } from '@/core/dateUtils';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { ReviewerProfileSummaryCard } from './ReviewerProfileSummaryCard';
import { ReviewStatsWidgets } from './ReviewStatsWidgets';
import { useMyReviewsTabs } from './tabs';

// Extended type to include review stats from backend
type CallReviewerPoolExtended = CallReviewerPool & {
  reviews_in_progress?: number;
  reviews_completed?: number;
  coi_count?: number;
  coi_by_severity?: Record<string, number>;
};

const StatusBadge: FC<{ status: string; statusDisplay: string }> = ({
  status,
  statusDisplay,
}) => {
  const variant = useMemo(() => {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'pending':
        return 'warning';
      case 'declined':
        return 'danger';
      case 'expired':
        return 'secondary';
      default:
        return 'primary';
    }
  }, [status]);

  return (
    <Badge variant={variant} size="sm" pill outline>
      {statusDisplay}
    </Badge>
  );
};

export const MyCallsPage: FC = () => {
  const tabs = useMyReviewsTabs();

  const filter = useMemo(
    () => ({
      my_invitations: true,
      invitation_status: ['accepted'],
    }),
    [],
  );

  const tableProps = useTable({
    table: 'MyCallsTable',
    fetchData: createFetcher(callReviewerPoolsList),
    filter,
    queryField: 'call_name',
  });

  const columns = useMemo(
    () => [
      {
        id: 'call',
        title: translate('Call'),
        render: ({ row }: { row: CallReviewerPoolExtended }) => (
          <span className="fw-bold">{row.call_name}</span>
        ),
        keys: ['call_name'],
      },
      {
        id: 'status',
        title: translate('Status'),
        render: ({ row }: { row: CallReviewerPoolExtended }) => (
          <StatusBadge
            status={row.invitation_status}
            statusDisplay={row.invitation_status_display}
          />
        ),
        keys: ['invitation_status', 'invitation_status_display'],
      },
      {
        id: 'reviews',
        title: translate('Reviews'),
        render: ({ row }: { row: CallReviewerPoolExtended }) => {
          const inProgress = row.reviews_in_progress || 0;
          const completed = row.reviews_completed || 0;
          const total = inProgress + completed;
          if (total === 0) {
            return <span className="text-muted">-</span>;
          }
          return (
            <div className="d-flex gap-1">
              {inProgress > 0 && (
                <Tip
                  id={`in-progress-${row.uuid}`}
                  label={translate('In progress')}
                >
                  <Badge variant="warning" pill outline>
                    {inProgress}
                  </Badge>
                </Tip>
              )}
              {completed > 0 && (
                <Tip
                  id={`completed-${row.uuid}`}
                  label={translate('Completed')}
                >
                  <Badge variant="success" pill outline>
                    {completed}
                  </Badge>
                </Tip>
              )}
            </div>
          );
        },
        keys: ['reviews_in_progress', 'reviews_completed'] as any,
      },
      {
        id: 'assignments',
        title: translate('Assignments'),
        render: ({ row }: { row: CallReviewerPoolExtended }) => (
          <span>
            {row.current_assignments}
            {row.max_assignments ? ` / ${row.max_assignments}` : ''}
          </span>
        ),
        keys: ['current_assignments', 'max_assignments'],
      },
      {
        id: 'coi',
        title: translate('COI'),
        render: ({ row }: { row: CallReviewerPoolExtended }) => {
          const coiCount = row.coi_count || 0;
          if (coiCount === 0) {
            return <span className="text-muted">-</span>;
          }
          const bySeverity = row.coi_by_severity || {};
          return (
            <div className="d-flex gap-1">
              {bySeverity.real > 0 && (
                <Tip id={`coi-real-${row.uuid}`} label={translate('Real')}>
                  <Badge variant="danger" pill outline>
                    {bySeverity.real}
                  </Badge>
                </Tip>
              )}
              {bySeverity.apparent > 0 && (
                <Tip
                  id={`coi-apparent-${row.uuid}`}
                  label={translate('Apparent')}
                >
                  <Badge variant="warning" pill outline>
                    {bySeverity.apparent}
                  </Badge>
                </Tip>
              )}
              {bySeverity.potential > 0 && (
                <Tip
                  id={`coi-potential-${row.uuid}`}
                  label={translate('Potential')}
                >
                  <Badge variant="info" pill outline>
                    {bySeverity.potential}
                  </Badge>
                </Tip>
              )}
            </div>
          );
        },
        keys: ['coi_count', 'coi_by_severity'] as any,
        optional: true,
      },
      {
        id: 'joined',
        title: translate('Joined'),
        render: ({ row }: { row: CallReviewerPoolExtended }) => (
          <span>{row.invited_at ? formatDate(row.invited_at) : '-'}</span>
        ),
        keys: ['invited_at'],
      },
    ],
    [],
  );

  return (
    <div className="d-flex flex-column" style={{ gap: 16 }}>
      {/* Reviewer profile summary */}
      <ReviewerProfileSummaryCard />

      {/* Stats widgets */}
      <ReviewStatsWidgets />

      {/* Calls table */}
      <Table<CallReviewerPoolExtended>
        {...tableProps}
        columns={columns}
        title={translate('My reviews')}
        tabs={tabs}
        verboseName={translate('calls')}
        hasOptionalColumns
        hasQuery
      />
    </div>
  );
};
