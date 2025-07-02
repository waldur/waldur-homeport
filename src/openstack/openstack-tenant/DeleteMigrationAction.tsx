import { TrashIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { openstackMigrationsDestroy } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

export const DeleteMigrationAction = ({ resource, refetch }) => {
  const dispatch = useDispatch();
  const openDialog = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate('Are you sure you want to delete the replication?'),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    await openstackMigrationsDestroy({ path: { uuid: resource.uuid } });
    await refetch();
  };
  return (
    <ActionItem
      title={translate('Remove')}
      action={openDialog}
      iconNode={<TrashIcon weight="bold" />}
      size="sm"
    />
  );
};
