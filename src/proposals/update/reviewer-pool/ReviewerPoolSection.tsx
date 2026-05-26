import { FC, useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';
import { CallReviewerPool, callReviewerPoolsList } from 'waldur-js-client';

import { translate } from '@/i18n';
import { Call } from '@/proposals/types';
import { createFetcher } from '@/table/api';
import {
  CallReviewerPoolsFilter,
  CallReviewerPoolsFilterFormId,
  InvitationStatusOptions,
  selectCallReviewerPoolsFilter,
} from '@/table/generated/CallReviewerPoolsFilter';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { InviteReviewerButton } from './InviteReviewerButton';
import { PoolSummaryButton } from './PoolSummaryButton';
import { ReviewerCoi } from './ReviewerCoi';
import { ReviewerInvitationDetails } from './ReviewerInvitationDetails';
import { ReviewerInvitationStatus } from './ReviewerInvitationStatus';
import { ReviewerNameAndEmail } from './ReviewerNameAndEmail';
import { ReviewerPoolExpandableRow } from './ReviewerPoolExpandableRow';
import { ReviewerReviews } from './ReviewerReviews';
import { ReviewerRowActions } from './ReviewerRowActions';
import { useReviewerPoolTabs } from './tabs';
import { CallReviewerPoolExtended } from './types';

interface ReviewerPoolSectionProps {
  call: Call;
  refetch: () => void;
}

const ReviewerPoolSectionTable: FC<ReviewerPoolSectionProps> = ({ call }) => {
  const { values } = useFormState();

  const formFilters = useMemo(
    () => selectCallReviewerPoolsFilter(values),
    [values],
  );

  const tabs = useReviewerPoolTabs();

  const filter = useMemo(
    () => ({
      call_uuid: call.uuid,
      ...formFilters,
    }),
    [formFilters],
  );

  const tableProps = useTable({
    table: 'CallReviewerPoolTable',
    fetchData: createFetcher(callReviewerPoolsList),
    filter,
  });

  const columns = useMemo(
    () => [
      {
        id: 'reviewer',
        title: translate('Reviewer'),
        render: ReviewerNameAndEmail,
        keys: [
          'reviewer_name',
          'reviewer_email',
          'invited_email',
          'invited_user_name',
        ],
      },
      {
        id: 'status',
        title: translate('Status'),
        render: ReviewerInvitationStatus,
        filter: 'invitation_status',
        inlineFilter: (row) =>
          InvitationStatusOptions.filter(
            (op) => op.value === row.invitation_status,
          ),
        keys: [
          'invitation_status',
          'invitation_status_display',
          'invitation_expires_at',
        ],
      },
      {
        id: 'reviews',
        title: translate('Reviews'),
        render: ReviewerReviews,
        keys: ['reviews_in_progress', 'reviews_completed'],
      },
      {
        id: 'coi',
        title: translate('COI'),
        render: ReviewerCoi,
        keys: ['coi_count', 'coi_by_severity'],
        optional: true,
      },
      {
        id: 'invited',
        title: translate('Invited'),
        render: ReviewerInvitationDetails,
        keys: ['invited_at', 'invitation_expires_at'],
      },
      {
        id: 'assignments',
        title: translate('Assignments'),
        render: ({ row }: { row: CallReviewerPool }) => (
          <span>
            {row.current_assignments}
            {row.max_assignments ? ` / ${row.max_assignments}` : ''}
          </span>
        ),
        keys: ['current_assignments', 'max_assignments'],
      },
      {
        id: 'expertise',
        title: translate('Expertise match'),
        render: ({ row }: { row: CallReviewerPool }) => (
          <span>
            {row.expertise_match_score !== null &&
            row.expertise_match_score !== undefined
              ? `${Math.round(row.expertise_match_score * 100)}%`
              : '-'}
          </span>
        ),
        keys: ['expertise_match_score'],
        optional: true,
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
      verboseName={translate('reviewer pool members')}
      showPageSizeSelector
      hasQuery
      filters={<CallReviewerPoolsFilter />}
      hasOptionalColumns
      expandableRow={ReviewerPoolExpandableRow}
      rowActions={({ row }: { row: CallReviewerPoolExtended }) => (
        <ReviewerRowActions row={row} refetch={tableProps.fetch} />
      )}
      tableActions={
        <>
          <PoolSummaryButton />
          <InviteReviewerButton call={call} refetch={tableProps.fetch} />
        </>
      }
      formId={CallReviewerPoolsFilterFormId}
    />
  );
};

export const ReviewerPoolSection: FC<any> = (props) => (
  <Form
    id={CallReviewerPoolsFilterFormId}
    onSubmit={() => {}}
    subscription={{
      values: true,
    }}
  >
    {() => <ReviewerPoolSectionTable {...props} />}
  </Form>
);
