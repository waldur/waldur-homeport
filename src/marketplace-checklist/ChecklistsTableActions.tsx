import { FC, useCallback } from 'react';

import { AddButton } from '@waldur/core/AddButton';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { useModal } from '@waldur/modal/hooks';

import { CHECKLIST_FORM_ID } from './constants';

interface ChecklistsTableActionsProps {
  refetch?(): void;
}

export const ChecklistsTableActions: FC<ChecklistsTableActionsProps> = ({
  refetch,
}) => {
  const { openDialog } = useModal();

  const openAddChecklistModal = useCallback(() => {
    openDialog(
      lazyComponent(() =>
        import('./checklists/ChecklistFormDialog').then((module) => ({
          default: module.ChecklistFormDialog,
        })),
      ),
      { resolve: { refetch }, formId: CHECKLIST_FORM_ID },
    );
  }, [refetch]);

  return <AddButton action={openAddChecklistModal} />;
};
