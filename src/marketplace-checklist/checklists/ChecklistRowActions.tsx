import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

import { CHECKLIST_FLAGS } from '../utils';

import { AddQuestionAction } from './AddQuestionAction';
import { ChecklistChangeStatusAction } from './ChecklistChangeStatusAction';
import { ChecklistDeleteAction } from './ChecklistDeleteAction';
import { ChecklistEditAction } from './ChecklistEditAction';

export const ChecklistRowActions = ({ row, fetch }) => {
  return (
    <ActionsDropdown
      row={row}
      refetch={fetch}
      actions={[
        AddQuestionAction,
        ChecklistEditAction,
        CHECKLIST_FLAGS.checklistActionChangeStatus &&
          ChecklistChangeStatusAction,
        ChecklistDeleteAction,
      ].filter(Boolean)}
    />
  );
};
