import {
  ListChecksIcon,
  PlusCircleIcon,
  SquaresFourIcon,
} from '@phosphor-icons/react';
import { FC, useCallback } from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { useModal } from '@waldur/modal/hooks';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';

import { CHECKLIST_FORM_ID } from './constants';

interface ChecklistsTableActionsProps {
  refetch?(): void;
}

export const ChecklistsTableActions: FC<ChecklistsTableActionsProps> = ({
  refetch,
}) => {
  const { openDialog } = useModal();
  const openAddCategoryModal = useCallback(() => {
    openDialog(
      lazyComponent(() =>
        import('./categories/CategoryFormDialog').then((module) => ({
          default: module.CategoryFormDialog,
        })),
      ),
      { resolve: { refetch }, size: 'sm' },
    );
  }, [refetch]);

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

  return (
    <ActionsDropdownComponent
      labeled
      drop="down"
      label={
        <>
          <span className="svg-icon svg-icon-2">
            <PlusCircleIcon weight="bold" />
          </span>
          {translate('Add')}
        </>
      }
      variant="primary"
      size="md"
    >
      <ActionItem
        title={translate('Category')}
        action={openAddCategoryModal}
        iconNode={<SquaresFourIcon weight="bold" />}
      />
      <ActionItem
        title={translate('Checklist')}
        action={openAddChecklistModal}
        iconNode={<ListChecksIcon weight="bold" />}
      />
    </ActionsDropdownComponent>
  );
};
