import { TrashIcon } from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { checklistsAdminCategoriesDestroy } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

export const CategoryDeleteAction = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const openDialog = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to delete the category {name}?',
          { name: <b>{row.name}</b> },
          formatJsxTemplate,
        ),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    await checklistsAdminCategoriesDestroy({
      path: { uuid: row.uuid },
    });
    // Invalidate query cache of categories request
    queryClient.invalidateQueries({ queryKey: ['ChecklistCategories'] });
    await refetch();
  };
  return (
    <ActionItem
      title={translate('Delete')}
      action={openDialog}
      iconNode={<TrashIcon weight="bold" />}
      className="text-danger"
      iconColor="danger"
    />
  );
};
