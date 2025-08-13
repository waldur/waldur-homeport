import { ArchiveBoxIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { checklistsAdminDestroy } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

export const ChecklistArchiveAction = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const openDialog = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to archive the checklist {name}?',
          { name: <b>{row.name}</b> },
          formatJsxTemplate,
        ),
        // FIX btn title
        { forDeletion: true, negativeButton: translate('Archive') },
      );
    } catch {
      return;
    }
    await checklistsAdminDestroy({ path: { uuid: row.uuid } });
    await refetch();
  };
  return (
    <ActionItem
      title={translate('Archive')}
      action={openDialog}
      iconNode={<ArchiveBoxIcon weight="bold" />}
      className="text-danger"
      iconColor="danger"
    />
  );
};
