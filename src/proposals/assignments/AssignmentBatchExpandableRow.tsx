import { ShieldWarningIcon } from '@phosphor-icons/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FC, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import {
  assignmentBatchesRetrieve,
  assignmentItemsForceUnblock,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { FAST_STALE_TIME } from '@/core/constants';
import { lazyComponent } from '@/core/lazyComponent';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

const StaffOverrideDialog = lazyComponent(() =>
  import('@/proposals/StaffOverrideDialog').then((m) => ({
    default: m.StaffOverrideDialog,
  })),
);

interface AssignmentBatchExpandableRowProps {
  row: { uuid: string };
}

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
      case 'expired':
        return 'secondary';
      case 'reassigned':
        return 'primary';
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

const OverrideIndicator: FC<{
  overrideReason: string;
  overriddenBy?: string;
  uuid: string;
}> = ({ overrideReason, overriddenBy, uuid }) => (
  <Tip
    id={`override-${uuid}`}
    label={
      overriddenBy
        ? translate('Overridden by {user}: {reason}', {
            user: overriddenBy,
            reason: overrideReason,
          })
        : translate('Override reason: {reason}', {
            reason: overrideReason,
          })
    }
  >
    <Badge
      variant="warning"
      leftIcon={<ShieldWarningIcon size={14} weight="bold" />}
      outline
    >
      {translate('Overridden')}
    </Badge>
  </Tip>
);

// Helper to create client-side paginated fetcher
const createClientPaginatedFetcher =
  <T,>(allData: T[]) =>
  () => {
    return Promise.resolve({
      rows: allData,
      resultCount: allData.length,
      nextPage: null,
    });
  };

export const AssignmentBatchExpandableRow: FC<
  AssignmentBatchExpandableRowProps
> = ({ row }) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const { data: batch, isLoading } = useQuery({
    queryKey: ['assignmentBatchDetails', row.uuid],
    queryFn: () =>
      assignmentBatchesRetrieve({ path: { uuid: row.uuid } }).then(
        (r) => r.data,
      ),
    staleTime: FAST_STALE_TIME,
  });

  const refetchBatch = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ['assignmentBatchDetails', row.uuid],
    });
  }, [queryClient, row.uuid]);

  const fetchData = useMemo(
    () => createClientPaginatedFetcher(batch?.items || []),
    [batch?.items],
  );

  const tableProps = useTable({
    table: `assignmentBatchItems-${row.uuid}`,
    fetchData,
  });

  const handleForceUnblock = useCallback(
    (item: { uuid: string; proposal_name?: string }) => {
      dispatch(
        openModalDialog(StaffOverrideDialog, {
          resolve: {
            onSubmit: (reason: string) =>
              assignmentItemsForceUnblock({
                path: { uuid: item.uuid },
                body: { override_reason: reason },
              }),
            title: translate('Force unblock assignment'),
            description: translate(
              'This assignment item is blocked due to a conflict of interest. Forcing an unblock will allow the reviewer to proceed with reviewing the proposal "{proposal}". A reason is required for audit purposes.',
              { proposal: item.proposal_name || '' },
            ),
            successMessage: translate('Assignment item unblocked.'),
            errorMessage: translate('Failed to unblock assignment item.'),
            submitLabel: translate('Force unblock'),
            fetch: refetchBatch,
          },
          size: 'lg',
        }),
      );
    },
    [dispatch, refetchBatch],
  );

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
          <strong>{translate('Manager notes')}:</strong>
          <p className="mb-0 mt-1">{batch.manager_notes}</p>
        </div>
      )}

      <Table
        {...tableProps}
        columns={[
          {
            title: translate('Proposal'),
            render: ({ row: item }) => (
              <div>
                <div className="fw-bold">{item.proposal_name}</div>
                <small className="text-muted">{item.proposal_slug}</small>
              </div>
            ),
          },
          {
            title: translate('Status'),
            render: ({ row: item }) => (
              <div className="d-flex align-items-center gap-2">
                <StatusBadge
                  status={item.status}
                  statusDisplay={item.status_display}
                />
                {item.override_reason && (
                  <OverrideIndicator
                    overrideReason={item.override_reason}
                    overriddenBy={item.overridden_by_name}
                    uuid={item.uuid}
                  />
                )}
              </div>
            ),
          },
          {
            title: translate('Affinity'),
            render: ({ row: item }) => (
              <span>
                {item.affinity_score !== null
                  ? `${Math.round(item.affinity_score * 100)}%`
                  : '-'}
              </span>
            ),
          },
          {
            title: translate('COI'),
            render: ({ row: item }) =>
              item.has_coi ? (
                <Badge variant="danger" outline>
                  {translate('COI detected')} ({item.coi_count})
                </Badge>
              ) : (
                <span className="text-muted">-</span>
              ),
          },
          {
            title: translate('Decline reason'),
            render: ({ row: item }) => (
              <span className="text-muted">
                {renderFieldOrDash(item.decline_reason)}
              </span>
            ),
          },
        ]}
        verboseName={translate('assignment items')}
        hasActionBar={false}
        minHeight="auto"
        rowActions={({ row: item }) =>
          item.status === 'coi_blocked' ? (
            <ActionsDropdownComponent>
              <ActionItem
                title={translate('Force unblock')}
                action={() => handleForceUnblock(item)}
                iconNode={<ShieldWarningIcon weight="bold" />}
                iconColor="warning"
                className="text-warning"
              />
            </ActionsDropdownComponent>
          ) : null
        }
      />
    </ExpandableContainer>
  );
};
