import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { sendNotification } from './api';

export const NotificationSendButton = ({ notification, refetch }) => {
  const dispatch = useDispatch();

  const callback = async () => {
    try {
      await sendNotification(notification.uuid);
      await refetch();
      dispatch(showSuccess(translate('Notification has been sent.')));
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to send notification.')));
    }
  };
  return (
    <Button onClick={callback} variant="light">
      <i className="fa fa-send" /> {translate('Send')}
    </Button>
  );
};
