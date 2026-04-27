import { CheckIcon, XIcon } from '@phosphor-icons/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FC, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import {
  myAssignmentBatchesList,
  myAssignmentBatchesRetrieve,
  assignmentItemsAccept,
  assignmentItemsDecline,
  MyAssignmentBatch,
  MyAssignmentItem,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { FAST_STALE_TIME } from '@/core/constants';
import { formatDateTime } from '@/core/dateUtils';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { showErrorResponse, showSuccess } from '@/store/notify';
import { createFetcher } from '@/table/api';
import { CompactActionButton } from '@/table/CompactActionButton';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { ReviewerProfileSummaryCard } from './ReviewerProfileSummaryCard';
import { ReviewStatsWidgets } from './ReviewStatsWidgets';
import { useMyReviewsTabs } from './tabs';

const StatusBadge: FC<{ status: string; statusDisplay: string }> = ({
  status,
  statusDisplay,
}) => {
  const variant = useMemo(() => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'accepted':
        return 'success';
      case 'declined':
        return 'danger';
      case 'coi_blocked':
        return 'info';
      default:
        return 'secondary';
    }
  }, [status]);

  return (
    <Badge variant={variant} pill outline>
      {statusDisplay}
    </Badge>
  );
};

interface AssignmentItemActionsProps {
  item: MyAssignmentItem;
  batchUuid: string;
  onSuccess: () => void;
}

const AssignmentItemActions: FC<AssignmentItemActionsProps> = ({
  item,
  onSuccess,
}) => {
  const dispatch = useDispatch();

  const acceptMutation = useMutation({
    mutationFn: () =>
      assignmentItemsAccept({
        path: { uuid: item.uuid },
      }),
    onSuccess: () => {
      dispatch(showSuccess(translate('Assignment accepted.')));
      onSuccess();
    },
    onError: (error: any) => {
      dispatch(showErrorResponse(error, translate('Unable to accept.')));
    },
  });

  const declineMutation = useMutation({
    mutationFn: (reason: string) =>
      assignmentItemsDecline({
        path: { uuid: item.uuid },
        body: { reason },
      }),
    onSuccess: () => {
      dispatch(showSuccess(translate('Assignment declined.')));
      onSuccess();
    },
    onError: (error: any) => {
      dispatch(showErrorResponse(error, translate('Unable to decline.')));
    },
  });

  const handleDecline = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Decline assignment'),
        translate(
          'Are you sure you want to decline reviewing this proposal: {proposal}?',
          { proposal: item.proposal_name },
        ),
        {
          positiveButton: translate('Decline'),
          positiveButtonVariant: 'danger',
        },
      );
    } catch {
      return;
    }
    declineMutation.mutate(translate('User declined'));
  };

  if (item.status !== 'pending') {
    return null;
  }

  return (
    <div className="d-flex gap-2">
      <CompactActionButton
        action={() => acceptMutation.mutate()}
        title={translate('Accept')}
        iconNode={<CheckIcon weight="bold" />}
        variant="success"
        pending={acceptMutation.isPending}
      />
      <CompactActionButton
        action={handleDecline}
        title={translate('Decline')}
        iconNode={<XIcon weight="bold" />}
        variant="outline-danger"
        pending={declineMutation.isPending}
      />
    </div>
  );
};

interface BatchExpandableRowProps {
  row: MyAssignmentBatch;
}

const BatchExpandableRow: FC<BatchExpandableRowProps> = ({ row }) => {
  const queryClient = useQueryClient();

  const { data: batch, isLoading } = useQuery({
    queryKey: ['myAssignmentBatchDetail', row.uuid],
    queryFn: () =>
      myAssignmentBatchesRetrieve({ path: { uuid: row.uuid } }).then(
        (r) => r.data,
      ),
    staleTime: FAST_STALE_TIME,
  });

  const handleItemSuccess = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ['myAssignmentBatchDetail', row.uuid],
    });
    queryClient.invalidateQueries({
      queryKey: ['table', 'MyAssignmentBatchesTable'],
    });
  }, [queryClient, row.uuid]);

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
        <p className="text-muted">{translate('No data available.')}</p>
      </ExpandableContainer>
    );
  }

  return (
    <ExpandableContainer>
      {batch.manager_notes && (
        <div className="mb-3 p-3 bg-light rounded">
          <strong>{translate('Notes from manager')}:</strong>
          <p className="mb-0 mt-1">{batch.manager_notes}</p>
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>{translate('Proposal')}</th>
              <th>{translate('Status')}</th>
              <th>{translate('Affinity')}</th>
              <th>{translate('COI')}</th>
              <th>{translate('Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {batch.items.map((item) => (
              <tr key={item.uuid}>
                <td>
                  <div className="fw-bold">{item.proposal_name}</div>
                  <small className="text-muted">{item.proposal_slug}</small>
                  {item.proposal_summary && (
                    <p className="text-muted small mt-1 mb-0">
                      {item.proposal_summary}
                    </p>
                  )}
                </td>
                <td>
                  <StatusBadge
                    status={item.status}
                    statusDisplay={item.status_display}
                  />
                </td>
                <td>
                  {item.affinity_score !== null
                    ? `${Math.round(item.affinity_score * 100)}%`
                    : '-'}
                </td>
                <td>
                  {item.has_coi ? (
                    <Badge variant="danger" outline>
                      {translate('COI detected')}
                    </Badge>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td>
                  <AssignmentItemActions
                    item={item}
                    batchUuid={row.uuid}
                    onSuccess={handleItemSuccess}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ExpandableContainer>
  );
};

const BatchStatusBadge: FC<{ status: string; statusDisplay: string }> = ({
  status,
  statusDisplay,
}) => {
  const variant = useMemo(() => {
    switch (status) {
      case 'draft':
        return 'secondary';
      case 'sent':
        return 'primary';
      case 'responded':
        return 'success';
      case 'expired':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  }, [status]);

  return (
    <Badge variant={variant} pill outline>
      {statusDisplay}
    </Badge>
  );
};

export const MyAssignmentsPage: FC = () => {
  const tabs = useMyReviewsTabs();

  const filter = useMemo(
    () => ({
      status: ['sent'],
    }),
    [],
  );

  const tableProps = useTable({
    table: 'MyAssignmentBatchesTable',
    fetchData: createFetcher(myAssignmentBatchesList),
    filter,
    queryField: 'call_name',
  });

  return (
    <div className="d-flex flex-column gap-6">
      <ReviewerProfileSummaryCard />
      <ReviewStatsWidgets />

      <Table<MyAssignmentBatch>
        {...tableProps}
        title={translate('My reviews')}
        tabs={tabs}
        columns={[
          {
            id: 'call',
            title: translate('Call'),
            render: ({ row }) => (
              <span className="fw-bold">{row.call_name}</span>
            ),
            keys: ['call_name'],
          },
          {
            id: 'status',
            title: translate('Status'),
            render: ({ row }) => (
              <BatchStatusBadge
                status={row.status}
                statusDisplay={row.status_display}
              />
            ),
            keys: ['status', 'status_display'],
          },
          {
            id: 'items',
            title: translate('Proposals'),
            render: ({ row }) => (
              <div>
                <span className="text-warning fw-bold">
                  {row.items_pending_count}
                </span>
                <span className="text-muted"> / {row.items_count}</span>
                <small className="text-muted ms-1">
                  {translate('pending')}
                </small>
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
            render: ({ row }) => (
              <>
                {row.expires_at ? formatDateTime(row.expires_at) : '-'}
                {row.is_expired && (
                  <Badge variant="danger" outline className="ms-1">
                    {translate('Expired')}
                  </Badge>
                )}
              </>
            ),
            keys: ['expires_at', 'is_expired'],
          },
        ]}
        verboseName={translate('assignment batches')}
        expandableRow={BatchExpandableRow}
        hasQuery
      />
    </div>
  );
};
