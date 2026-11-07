import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import {
  myAssignmentBatchesRetrieve,
  MyAssignmentBatch,
  MyAssignmentItem,
} from 'waldur-js-client';

import {
  Badge,
  EmptyState,
  HelpIcon,
  Table as TablePrimitive,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { FAST_STALE_TIME } from '@/core/constants';
import { formatDateTime } from '@/core/dateUtils';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { AssignmentBatchStatusBadge } from '@/proposals/assignments/AssignmentBatchStatusBadge';
import { AssignmentStatusBadge } from '@/proposals/assignments/AssignmentStatusBadge';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { AcceptAssignmentAction } from './AcceptAssignmentAction';
import { DeclineAssignmentAction } from './DeclineAssignmentAction';
import { fetchMyAssignmentBatches } from './fetchMyAssignmentBatches';
import { useMyWorkTitle } from './myWorkTitle';
import { ExpiredResponseNotice, ResponseTimeLeft } from './ResponseDeadline';
import { ReviewerProfileSummaryCard } from './ReviewerProfileSummaryCard';
import { ReviewStatsWidgets } from './ReviewStatsWidgets';
import { useMyReviewsTabs } from './tabs';

interface AssignmentItemActionsProps {
  item: MyAssignmentItem;
  batchUuid: string;
}

// The API reports an item past its deadline as expired even before the
// periodic expiry task has stored that, so Accept and Decline are offered only
// while the response can still be given.
export const AssignmentItemActions: FC<AssignmentItemActionsProps> = ({
  item,
  batchUuid,
}) => {
  if (item.is_expired || item.status === 'expired') {
    return <ExpiredResponseNotice expiresAt={item.expires_at} />;
  }
  if (item.status !== 'pending') {
    return null;
  }

  return (
    <div className="flex flex-col gap-1 items-start">
      <div className="flex gap-1.5">
        <AcceptAssignmentAction item={item} batchUuid={batchUuid} />
        <DeclineAssignmentAction item={item} batchUuid={batchUuid} />
      </div>
      <ResponseTimeLeft expiresAt={item.expires_at} />
    </div>
  );
};

interface BatchExpandableRowProps {
  row: MyAssignmentBatch;
}

const BatchExpandableRow: FC<BatchExpandableRowProps> = ({ row }) => {
  const { data: batch, isLoading } = useQuery({
    queryKey: ['myAssignmentBatchDetail', row.uuid],
    queryFn: () =>
      myAssignmentBatchesRetrieve({ path: { uuid: row.uuid } }).then(
        (r) => r.data,
      ),
    staleTime: FAST_STALE_TIME,
  });

  if (isLoading) {
    return (
      <ExpandableContainer>
        <LoadingSpinner />
      </ExpandableContainer>
    );
  }

  if (!batch) {
    return (
      <ExpandableContainer>
        <EmptyState size="sm" message={translate('No data available.')} />
      </ExpandableContainer>
    );
  }

  return (
    <ExpandableContainer>
      {batch.manager_notes && (
        <div className="mb-2.5 p-2.5 bg-tertiary dark:bg-quaternary rounded-lg">
          <strong>{translate('Notes from manager')}:</strong>
          <p className="mb-0 mt-1">{batch.manager_notes}</p>
        </div>
      )}

      <TablePrimitive density="compact" className="align-middle">
        <TableHeader>
          <TableRow>
            <TableHead>{translate('Proposal')}</TableHead>
            <TableHead>{translate('Status')}</TableHead>
            <TableHead>{translate('Affinity')}</TableHead>
            <TableHead>{translate('COI')}</TableHead>
            <TableHead>{translate('Actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {batch.items.map((item) => (
            <TableRow key={item.uuid}>
              <TableCell>
                <div className="font-medium">{item.proposal_name}</div>
                <span className="text-quaternary">{item.proposal_slug}</span>
                {item.proposal_summary && (
                  <p className="text-quaternary mt-1 mb-0">
                    {item.proposal_summary}
                  </p>
                )}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <AssignmentStatusBadge
                  status={item.status}
                  statusDisplay={item.status_display}
                  size="sm"
                />
              </TableCell>
              <TableCell>
                {item.affinity_score !== null
                  ? `${Math.round(item.affinity_score * 100)}%`
                  : '-'}
              </TableCell>
              <TableCell>
                {item.has_coi ? (
                  <span className="inline-flex items-center gap-1">
                    <Badge variant="danger" size="sm" tone="outline">
                      {translate('COI detected')}
                    </Badge>
                    <HelpIcon
                      label={translate(
                        'A potential conflict of interest was detected for this proposal. It may be blocked from assignment.',
                      )}
                      size={14}
                    />
                  </span>
                ) : (
                  <span className="text-quaternary">-</span>
                )}
              </TableCell>
              <TableCell>
                <AssignmentItemActions item={item} batchUuid={row.uuid} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TablePrimitive>
    </ExpandableContainer>
  );
};

export const MyAssignmentsPage: FC = () => {
  const myWorkTitle = useMyWorkTitle();
  const tabs = useMyReviewsTabs();

  // Expired batches stay listed so the reviewer sees why they can no longer
  // respond; the tab count asks for sent batches only.
  const filter = useMemo(
    () => ({
      status: ['sent', 'expired'],
    }),
    [],
  );

  const tableProps = useTable({
    table: 'MyAssignmentBatchesTable',
    fetchData: fetchMyAssignmentBatches,
    filter,
    queryField: 'call_name',
  });

  return (
    <div className="flex flex-col" style={{ gap: 16 }}>
      <ReviewerProfileSummaryCard />
      <ReviewStatsWidgets />

      <Table<MyAssignmentBatch>
        {...tableProps}
        title={myWorkTitle}
        tabs={tabs}
        columns={[
          {
            id: 'call',
            title: translate('Call'),
            render: ({ row }) => (
              <span className="font-medium text-primary">{row.call_name}</span>
            ),
            keys: ['call_name'],
          },
          {
            id: 'status',
            title: translate('Status'),
            render: ({ row }) => (
              <AssignmentBatchStatusBadge
                status={row.status}
                statusDisplay={row.status_display}
                size="sm"
              />
            ),
            keys: ['status', 'status_display'],
          },
          {
            id: 'items',
            title: translate('Proposals'),
            render: ({ row }) => (
              <div>
                <span className="text-warning font-medium">
                  {row.items_pending_count}
                </span>
                <span className="text-quaternary"> / {row.items_count}</span>
                <span className="text-quaternary ms-1">
                  {translate('pending')}
                </span>
              </div>
            ),
            keys: ['items_count', 'items_pending_count'],
          },
          {
            id: 'sent_at',
            title: translate('Sent'),
            render: ({ row }) => <>{formatDateTime(row.sent_at)}</>,
            keys: ['sent_at'],
          },
          {
            id: 'expires_at',
            title: translate('Expires'),
            render: ({ row }) =>
              row.status === 'expired' ? (
                <ExpiredResponseNotice expiresAt={row.expires_at} />
              ) : (
                <div className="flex flex-col gap-1 items-start">
                  <span>
                    {row.expires_at ? formatDateTime(row.expires_at) : '-'}
                  </span>
                  {row.status === 'sent' && (
                    <ResponseTimeLeft expiresAt={row.expires_at} />
                  )}
                </div>
              ),
            keys: ['expires_at', 'is_expired', 'status'],
          },
        ]}
        verboseName={translate('assignment batches')}
        expandableRow={BatchExpandableRow}
        hasQuery
      />
    </div>
  );
};
