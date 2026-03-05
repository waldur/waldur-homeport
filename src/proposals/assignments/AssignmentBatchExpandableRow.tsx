import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { assignmentBatchesRetrieve } from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

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
  const { data: batch, isLoading } = useQuery({
    queryKey: ['assignmentBatchDetails', row.uuid],
    queryFn: () =>
      assignmentBatchesRetrieve({ path: { uuid: row.uuid } }).then(
        (r) => r.data,
      ),
    staleTime: 30000,
  });

  const fetchData = useMemo(
    () => createClientPaginatedFetcher(batch?.items || []),
    [batch?.items],
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
              <StatusBadge
                status={item.status}
                statusDisplay={item.status_display}
              />
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
      />
    </ExpandableContainer>
  );
};
