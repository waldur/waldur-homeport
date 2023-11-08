import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const BroadcastTemplateCreateDialog = lazyComponent(
  () => import('./BroadcastTemplateCreateDialog'),
  'BroadcastTemplateCreateDialog',
);

export const BroadcastTemplateCreateButton: FunctionComponent<{ refetch }> = ({
  refetch,
}) => {
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(BroadcastTemplateCreateDialog, {
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
