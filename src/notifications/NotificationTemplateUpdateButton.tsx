import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const NotificationTemplateUpdateDialog = lazyComponent(
  () => import('./NotificationTemplateUpdateDialog'),
  'NotificationTemplateUpdateDialog',
);

export const NotificationTemplateUpdateButton: FunctionComponent<{
  template;
  refetch;
}> = ({ template, refetch }) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(NotificationTemplateUpdateDialog, {
        dialogClassName: 'modal-dialog-centered',
        resolve: { template, refetch },
        size: 'lg',
      }),
    );
  };
  return (
    <ActionButton
      action={callback}
      title={translate('Edit')}
      icon="fa fa-pencil"
    />
  );
};
