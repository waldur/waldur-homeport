import { TrashIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { checklistsAdminDestroy } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

export const ChecklistDeleteAction = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const openDialog = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to delete the checklist {name}? This action cannot be undone.',
          { name: <b>{row.name}</b> },
          formatJsxTemplate,
        ),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    await checklistsAdminDestroy({ path: { uuid: row.uuid } });
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
