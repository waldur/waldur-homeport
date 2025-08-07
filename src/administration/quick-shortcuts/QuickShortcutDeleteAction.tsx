import { TrashIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { externalLinksDestroy } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

import { useInvalidateShortcuts } from './utils';

export const QuickShortcutDeleteAction = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const invalidateShortcuts = useInvalidateShortcuts();

  const openDialog = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate('Are you sure you want to delete the shortcut?'),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    await externalLinksDestroy({ path: { uuid: row.uuid } });
    await refetch();
    invalidateShortcuts();
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
