import { BellSimpleIcon, BellSimpleSlashIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import {
  notificationMessagesDisable,
  notificationMessagesEnable,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const NotificationToggleButton: FunctionComponent<{
  row;
  refetch;
}> = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const callback = async () => {
    if (row.enabled) {
      try {
        await notificationMessagesDisable({ path: { uuid: row.uuid } });
        dispatch(showSuccess(translate('The notification has been disabled')));
      } catch (error) {
        dispatch(
          showErrorResponse(
            error,
            translate('Error disabling the notification.'),
          ),
        );
      }
    } else {
      try {
        await notificationMessagesEnable({ path: { uuid: row.uuid } });
        dispatch(showSuccess(translate('The notification has been enabled')));
      } catch (error) {
        dispatch(
          showErrorResponse(
            error,
            translate('Error enabling the notification.'),
          ),
        );
      }
    }
    refetch();
  };
  return (
    <ActionItem
      action={callback}
      title={row.enabled ? translate('Disable') : translate('Enable')}
      iconNode={
        row.enabled ? (
          <BellSimpleIcon weight="bold" />
        ) : (
          <BellSimpleSlashIcon weight="bold" />
        )
      }
      size="sm"
      className={row.enabled ? 'text-warning' : 'text-success'}
      iconColor={row.enabled ? 'warning' : 'success'}
    />
  );
};
