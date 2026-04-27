import { ActionsDropdown } from '@/table/ActionsDropdown';

import { QuestionDeleteAction } from './QuestionDeleteAction';
import { QuestionEditAction } from './QuestionEditAction';

export const QuestionRowActions = ({ row, fetch }) => {
  return (
    <ActionsDropdown
      row={row}
      refetch={fetch}
      actions={[QuestionEditAction, QuestionDeleteAction]}
    />
  );
};
