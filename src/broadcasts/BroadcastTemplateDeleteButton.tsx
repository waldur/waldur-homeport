import { TrashIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { broadcastMessageTemplatesDestroy } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

export const BroadcastTemplateDeleteButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const openDialog = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to delete the template {template_name}?',
          {
            template_name: <strong>{row.name}</strong>,
          },
          formatJsxTemplate,
        ),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    await broadcastMessageTemplatesDestroy({ path: { uuid: row.uuid } });
    await refetch();
  };
  return (
    <ActionItem
      title={translate('Remove')}
      action={openDialog}
      iconNode={<TrashIcon weight="bold" />}
      size="sm"
      iconColor="danger"
      className="text-danger"
    />
  );
};
