import { ProposalReview } from 'waldur-js-client';

import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

import { ShowReviewCommentsAction } from './ShowReviewCommentsAction';

type ProposalReviewsRowActionsProps = {
  row: ProposalReview;
};

export const ProposalReviewsRowActions = ({
  row,
}: ProposalReviewsRowActionsProps) => {
  return <ActionsDropdown row={row} actions={[ShowReviewCommentsAction]} />;
};
