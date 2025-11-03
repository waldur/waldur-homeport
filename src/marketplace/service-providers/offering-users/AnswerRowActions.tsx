import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

import { AnswerReviewAction } from './AnswerReviewAction';

export const AnswerRowActions = ({
  row,
  fetch,
  question,
  offeringUserUuid,
}) => {
  return (
    <ActionsDropdown
      row={row}
      refetch={fetch}
      data={{ offeringUserUuid, question }}
      actions={[AnswerReviewAction]}
    />
  );
};
