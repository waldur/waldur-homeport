import { FC, useMemo } from 'react';
import { proposalReviewsList } from 'waldur-js-client';

import { formatDate } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { ReviewStateRenderer } from '@/proposals/review/ReviewStateRenderer';
import { Call, ProposalReview } from '@/proposals/types';
import { createFetcher } from '@/table/api';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { CallReviewerPoolExtended } from './types';

/**
 * The states the pool's Reviews count adds up (in progress and completed), so
 * the dialog lists exactly what the count counts: a rejected review is left
 * out of both.
 */
export const COUNTED_REVIEW_STATES = ['in_review', 'submitted'] as const;

const ReviewsTable: FC<{ call: Call; userUuid: string }> = ({
  call,
  userUuid,
}) => {
  const filter = useMemo(
    () => ({
      call_uuid: call.uuid,
      reviewer_uuid: userUuid,
      state: COUNTED_REVIEW_STATES,
    }),
    [call.uuid, userUuid],
  );
  const tableProps = useTable({
    table: `ReviewerPoolReviews-${call.uuid}-${userUuid}`,
    fetchData: createFetcher(proposalReviewsList),
    filter,
  });
  return (
    <Table<ProposalReview>
      {...tableProps}
      title={null}
      // The dialog draws a table's one border; no card round it as well.
      cardBordered={false}
      bodyClassName="p-0"
      hasActionBar={false}
      placeholderHasRetry={false}
      minHeight="auto"
      verboseName={translate('reviews')}
      columns={[
        {
          title: translate('Proposal'),
          render: ({ row }) => (
            <Link
              state="call-management.proposal-details"
              params={{
                uuid: call.customer_uuid,
                proposal_uuid: row.proposal_uuid,
                review_uuid: row.uuid,
              }}
              label={row.proposal_name}
            />
          ),
          keys: ['proposal_name', 'proposal_uuid'],
        },
        {
          title: translate('State'),
          render: ReviewStateRenderer,
          keys: ['state'],
        },
        {
          title: translate('Score'),
          render: ({ row }) => (
            <>
              {row.state === 'submitted'
                ? renderFieldOrDash(row.summary_score)
                : DASH_ESCAPE_CODE}
            </>
          ),
          keys: ['summary_score'],
        },
        {
          title: translate('Review due'),
          render: ({ row }) => (
            <>
              {row.review_end_date
                ? formatDate(row.review_end_date)
                : DASH_ESCAPE_CODE}
            </>
          ),
          keys: ['review_end_date'],
        },
      ]}
    />
  );
};

interface ReviewerReviewsDialogProps {
  resolve: { call: Call; row: CallReviewerPoolExtended };
}

/** The reviews a pool member has in progress or completed in this call. */
export const ReviewerReviewsDialog: FC<ReviewerReviewsDialogProps> = ({
  resolve: { call, row },
}) => {
  // A review names its reviewer by user, the pool by reviewer profile; the
  // pool row carries the user the count is made for.
  const userUuid = row.reviewer_user_uuid;
  const name = row.reviewer_name || row.invited_user_name || row.invited_email;

  return (
    <ModalDialog
      title={translate("{name}'s reviews", { name })}
      subtitle={call.name}
    >
      {userUuid ? (
        <ReviewsTable call={call} userUuid={userUuid} />
      ) : (
        <p className="text-quaternary mb-0">
          {translate('This reviewer has no account yet, so no reviews.')}
        </p>
      )}
    </ModalDialog>
  );
};
