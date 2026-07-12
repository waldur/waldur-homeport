import { FC, useMemo } from 'react';
import { proposalReviewsList, type ProposalReview } from 'waldur-js-client';

import { formatDate } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { Proposal } from '@/proposals/types';
import { createFetcher } from '@/table/api';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { ReviewExpandableRow } from '../review/ReviewExpandableRow';
import { ReviewStateRenderer } from '../review/ReviewStateRenderer';

interface ProposalReviewsDialogProps {
  proposal: Proposal;
}

// Read-only overview of every review assigned to a proposal (all states), so a
// call manager can see who is reviewing and where each review stands without
// leaving the proposal. Rows expand to the reviewer's scores/comments via the
// shared ReviewExpandableRow (also used by the admin reviews list).
export const ProposalReviewsDialog: FC<ProposalReviewsDialogProps> = ({
  proposal,
}) => {
  const filter = useMemo(
    () => ({ proposal_uuid: proposal.uuid }),
    [proposal.uuid],
  );
  const tableProps = useTable({
    table: 'ProposalReviewsDialog',
    fetchData: createFetcher(proposalReviewsList),
    filter,
  });

  return (
    <ModalDialog title={translate('Reviews')} subtitle={proposal.name}>
      <Table<ProposalReview>
        {...tableProps}
        title={null}
        hasActionBar={false}
        columns={[
          {
            title: translate('Reviewer'),
            render: ({ row }) => (
              <>{renderFieldOrDash(row.reviewer_full_name)}</>
            ),
            keys: ['reviewer_full_name'],
          },
          {
            title: translate('State'),
            render: ReviewStateRenderer,
            keys: ['state'],
          },
          {
            title: translate('Score'),
            render: ({ row }) => <>{renderFieldOrDash(row.summary_score)}</>,
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
        expandableRow={ReviewExpandableRow}
        hideRefresh
        minHeight="auto"
      />
    </ModalDialog>
  );
};
