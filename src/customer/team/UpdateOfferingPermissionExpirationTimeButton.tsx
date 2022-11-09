import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const UpdateOfferingPermissionExpirationTimeDialog = lazyComponent(
  () => import('./UpdateOfferingPermissionExpirationTimeDialog'),
  'UpdateOfferingPermissionExpirationTimeDialog',
);

export const UpdateOfferingPermissionExpirationTimeButton: FunctionComponent<{
  permission;
}> = ({ permission }) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(UpdateOfferingPermissionExpirationTimeDialog, {
        resolve: { permission },
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
