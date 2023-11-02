import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const NotificationTemplateCreateDialog = lazyComponent(
  () => import('./NotificationTemplateCreateDialog'),
  'NotificationTemplateCreateDialog',
);

export const NotificationTemplateCreateButton: FunctionComponent<{ refetch }> =
  ({ refetch }) => {
    const dispatch = useDispatch();
    const callback = () =>
      dispatch(
        openModalDialog(NotificationTemplateCreateDialog, {
          dialogClassName: 'modal-dialog-centered',
          resolve: {
            refetch,
          },
          size: 'lg',
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
