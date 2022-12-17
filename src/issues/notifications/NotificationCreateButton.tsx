import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const NotificationCreateDialog = lazyComponent(
  () => import('./NotificationCreateDialog'),
  'NotificationCreateDialog',
);

export const NotificationCreateButton: FunctionComponent<{ refreshList }> = ({
  refreshList,
}) => {
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(NotificationCreateDialog, {
        dialogClassName: 'modal-dialog-centered mw-650px',
        resolve: {
          refreshList,
        },
      }),
    );
  return (
    <ActionButton
      action={callback}
      title={translate('Create')}
      icon="fa fa-plus"
      variant="primary"
    />
  );
};
