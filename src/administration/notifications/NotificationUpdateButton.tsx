import { PencilSimple } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { RowActionButton } from '@waldur/table/ActionButton';

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
  return (
    <RowActionButton
      action={callback}
      title={translate('Edit')}
      iconNode={<PencilSimple />}
      size="sm"
    />
  );
};
