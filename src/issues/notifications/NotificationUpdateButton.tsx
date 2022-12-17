import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

import { parseNotification } from './utils';

const NotificationUpdateDialog = lazyComponent(
  () => import('./NotificationUpdateDialog'),
  'NotificationUpdateDialog',
);

export const NotificationUpdateButton: FunctionComponent<{
  notification;
  refreshList;
}> = ({ notification, refreshList }) => {
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(NotificationUpdateDialog, {
        dialogClassName: 'modal-dialog-centered mw-650px',
        resolve: {
          initialValues: parseNotification(notification),
          uuid: notification.uuid,
          refreshList,
        },
      }),
    );
  return (
    <ActionButton
      action={callback}
      title={translate('Update')}
      icon="fa fa-edit"
      variant="light"
      className="me-3"
    />
  );
};
