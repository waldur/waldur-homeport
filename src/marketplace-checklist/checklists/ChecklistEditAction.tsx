import { FC, useCallback } from 'react';
import { Checklist } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditAction } from '@waldur/form/EditAction';
import { useModal } from '@waldur/modal/hooks';

import { CHECKLIST_FORM_ID } from '../constants';

const ChecklistFormDialog = lazyComponent(() =>
  import('./ChecklistFormDialog').then((module) => ({
    default: module.ChecklistFormDialog,
  })),
);

interface ChecklistEditActionProps {
  row: Checklist;
  refetch(): void;
}

export const ChecklistEditAction: FC<ChecklistEditActionProps> = ({
  row,
  refetch,
}) => {
  const { openDialog } = useModal();
  const callback = useCallback(() => {
    openDialog(ChecklistFormDialog, {
      resolve: { refetch, checklistUuid: row.uuid },
      initialValues: {
        name: row.name,
        category: row.category_uuid,
        checklist_type: row.checklist_type,
        description: row.description,
      },
      formId: CHECKLIST_FORM_ID,
    });
  }, [row, refetch]);

  return <EditAction action={callback} />;
};
