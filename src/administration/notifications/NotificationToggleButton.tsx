import { BellSimple, BellSimpleSlash } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';

import { disableNotification, enableNotification } from './api';

export const NotificationToggleButton: FunctionComponent<{
  notification;
  refetch;
}> = ({ notification, refetch }) => {
  const dispatch = useDispatch();
  const callback = async () => {
    if (notification.enabled) {
      try {
        await disableNotification(notification.url);
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
        await enableNotification(notification.url);
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
    <ActionButton
      action={callback}
      title={notification.enabled ? translate('Disable') : translate('Enable')}
      iconNode={notification.enabled ? <BellSimple /> : <BellSimpleSlash />}
      className={`ms-3 btn ${
        notification.enabled ? 'btn-danger' : 'btn-success'
      }`}
    />
  );
};
