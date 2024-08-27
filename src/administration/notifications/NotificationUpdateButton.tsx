import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditButton } from '@waldur/form/EditButton';
import { openModalDialog } from '@waldur/modal/actions';

const NotificationUpdateDialog = lazyComponent(
  () => import('./NotificationUpdateDialog'),
  'NotificationUpdateDialog',
);

export const NotificationUpdateButton: FunctionComponent<{
  notification;
  refetch;
}> = ({ notification, refetch }) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(NotificationUpdateDialog, {
        dialogClassName: 'modal-dialog-centered',
        resolve: { notification, refetch },
        size: 'xl',
      }),
    );
  };
  return <EditButton onClick={callback} size="sm" />;
};
