import { FC, useCallback, useMemo } from 'react';
import { callReviewerPoolsList, CallReviewerPool } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { Call } from '../types';

import { ReviewerCapacityRowActions } from './ReviewerCapacityRowActions';

const EditCapacityDialog = lazyComponent(() =>
  import('./EditCapacityDialog').then((m) => ({
    default: m.EditCapacityDialog,
  })),
);

interface ReviewerCapacitySectionProps {
  call: Call;
}

export const ReviewerCapacitySection: FC<ReviewerCapacitySectionProps> = ({
  call,
}) => {
  const { openDialog } = useModal();

  const filter = useMemo(
    () => ({
      call_uuid: call.uuid,
      invitation_status: 'accepted',
    }),
    [],
  );

  const tableProps = useTable({
    table: 'ReviewerCapacityTable',
    fetchData: createFetcher(callReviewerPoolsList),
    filter,
  });

  const handleEditCapacity = useCallback((row: CallReviewerPool) => {
    openDialog(EditCapacityDialog, {
      resolve: { poolMember: row, refetch: tableProps.fetch },
    });
  }, []);

  const columns = useMemo(
    () => [
      {
        id: 'reviewer',
        title: translate('Reviewer'),
        render: ({ row }: { row: CallReviewerPool }) => (
          <div>
            <div className="fw-bold">
              {renderFieldOrDash(row.reviewer_name)}
            </div>
            <small className="text-muted">{row.reviewer_email}</small>
          </div>
        ),
        keys: ['reviewer_name', 'reviewer_email'] as (keyof CallReviewerPool)[],
      },
      {
        id: 'current',
        title: translate('Current'),
        render: ({ row }: { row: CallReviewerPool }) => (
          <span>{row.current_assignments}</span>
        ),
        keys: ['current_assignments'] as (keyof CallReviewerPool)[],
      },
      {
        id: 'max',
        title: translate('Max'),
        render: ({ row }: { row: CallReviewerPool }) => (
          <span>{row.max_assignments}</span>
        ),
        keys: ['max_assignments'] as (keyof CallReviewerPool)[],
      },
      {
        id: 'utilization',
        title: translate('Utilization'),
        render: ({ row }: { row: CallReviewerPool }) => {
          const percentage = row.max_assignments
            ? Math.round((row.current_assignments / row.max_assignments) * 100)
            : 0;
          return (
            <div className="d-flex align-items-center gap-2">
              <div
                className="progress flex-grow-1"
                style={{ height: '8px', minWidth: '60px' }}
              >
                <div
                  className={`progress-bar ${
                    percentage >= 100
                      ? 'bg-danger'
                      : percentage >= 80
                        ? 'bg-warning'
                        : 'bg-success'
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <small className="text-muted">{percentage}%</small>
            </div>
          );
        },
        keys: [
          'current_assignments',
          'max_assignments',
        ] as (keyof CallReviewerPool)[],
      },
    ],
    [],
  );

  return (
    <Table<CallReviewerPool>
      {...tableProps}
      columns={columns}
      verboseName={translate('reviewers')}
      showPageSizeSelector
      hasQuery
      rowActions={({ row }) => (
        <ReviewerCapacityRowActions
          row={row}
          onEdit={() => handleEditCapacity(row)}
        />
      )}
    />
  );
};
