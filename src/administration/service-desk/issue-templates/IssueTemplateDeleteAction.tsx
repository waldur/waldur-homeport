import { TrashIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { supportTemplatesDestroy } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

export const IssueTemplateDeleteAction = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const openDialog = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate('Are you sure you want to delete the issue template?'),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    await supportTemplatesDestroy({ path: { uuid: row.uuid } });
    await refetch();
  };
  return (
    <ActionItem
      title={translate('Remove')}
      action={openDialog}
      iconNode={<TrashIcon weight="bold" />}
      className="text-danger"
      iconColor="danger"
      size="sm"
    />
  );
};
