import { ProhibitInsetIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { maintenanceAnnouncementsDestroy } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

export const MaintenanceStopAction = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const openDialog = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate('Are you sure you want to stop the maintenance record?'),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    await maintenanceAnnouncementsDestroy({
      path: { uuid: row.uuid },
    });
    await refetch();
  };
  return (
    <ActionItem
      title={translate('Stop')}
      action={openDialog}
      iconNode={<ProhibitInsetIcon weight="bold" />}
      className="text-danger"
      iconColor="danger"
    />
  );
};
