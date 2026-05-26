import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FC, useCallback, useMemo } from 'react';
import { assignmentBatchesRetrieve } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { FAST_STALE_TIME } from '@/core/constants';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';
import { createClientPaginatedFetcher } from '@/table/api';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { AssignmentOverrideIndicator } from './AssignmentOverrideIndicator';
import { AssignmentStatusBadge } from './AssignmentStatusBadge';
import { ForceUnblockAssignmentAction } from './ForceUnblockAssignmentAction';

interface AssignmentBatchExpandableRowProps {
  row: { uuid: string };
}

export const AssignmentBatchExpandableRow: FC<
  AssignmentBatchExpandableRowProps
> = ({ row }) => {
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
    [batch],
  );

  const tableProps = useTable({
    table: `assignmentBatchItems-${row.uuid}`,
    fetchData,
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
                <AssignmentStatusBadge
                  status={item.status}
                  statusDisplay={item.status_display}
                />
                {item.override_reason && (
                  <AssignmentOverrideIndicator
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
              <ForceUnblockAssignmentAction
                item={item}
                refetchBatch={refetchBatch}
              />
            </ActionsDropdownComponent>
          ) : null
        }
      />
    </ExpandableContainer>
  );
};
