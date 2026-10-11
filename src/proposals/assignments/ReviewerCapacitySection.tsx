import { FC, useMemo } from 'react';
import { callReviewerPoolsList, CallReviewerPool } from 'waldur-js-client';

import { Progress } from 'waldur-ui';

import { translate } from '@/i18n';
import { useReviewerPoolTabs } from '@/proposals/update/reviewer-pool/tabs';
import { canManageCallReviews } from '@/proposals/utils';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useUser } from '@/workspace/hooks';

import { Call } from '../types';

import { ReviewerCapacityRowActions } from './ReviewerCapacityRowActions';

interface ReviewerCapacitySectionProps {
  call: Call;
  refetch?: () => void;
}

export const ReviewerCapacitySection: FC<ReviewerCapacitySectionProps> = ({
  call,
}) => {
  const tabs = useReviewerPoolTabs();
  const canManage = canManageCallReviews(useUser(), call);
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
              <Progress
                className="flex-grow-1 min-w-[60px]"
                value={percentage}
                variant={
                  percentage >= 100
                    ? 'danger'
                    : percentage >= 80
                      ? 'warning'
                      : 'success'
                }
              />
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
      title={translate('Reviewer pool')}
      tabs={tabs}
      verboseName={translate('reviewers')}
      showPageSizeSelector
      hasQuery
      rowActions={
        canManage
          ? ({ row }) => (
              <ReviewerCapacityRowActions
                row={row}
                refetch={tableProps.fetch}
              />
            )
          : undefined
      }
    />
  );
};
