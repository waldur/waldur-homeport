import { ActionsDropdown } from '@/table/ActionsDropdown';

import { AnswerDeleteAction } from './AnswerDeleteAction';
import { AnswerEditAction } from './AnswerEditAction';

export const AnswerRowActions = ({ row, fetch, question, projectUuid }) => {
  return (
    <ActionsDropdown
      row={row}
      refetch={fetch}
      data={{ projectUuid, question }}
      actions={[AnswerEditAction, AnswerDeleteAction]}
    />
  );
};
