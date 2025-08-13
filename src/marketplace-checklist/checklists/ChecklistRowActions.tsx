import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

import { CHECKLIST_FLAGS } from '../utils';

import { AddQuestionAction } from './AddQuestionAction';
import { ChecklistArchiveAction } from './ChecklistArchiveAction';
import { ChecklistChangeStatusAction } from './ChecklistChangeStatusAction';
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
        ChecklistArchiveAction,
      ].filter(Boolean)}
    />
  );
};
