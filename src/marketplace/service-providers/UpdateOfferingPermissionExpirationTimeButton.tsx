import { PencilSimple } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { RowActionButton } from '@waldur/table/ActionButton';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

const UpdateOfferingPermissionExpirationTimeDialog = lazyComponent(
  () => import('./UpdateOfferingPermissionExpirationTimeDialog'),
  'UpdateOfferingPermissionExpirationTimeDialog',
);

export const UpdateOfferingPermissionExpirationTimeButton: FunctionComponent<{
  permission;
  fetch;
}> = ({ permission, fetch }) => {
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);
  const canUpdatePermission = hasPermission(user, {
    permission: PermissionEnum.UPDATE_OFFERING_PERMISSION,
    customerId: customer.uuid,
  });

  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(UpdateOfferingPermissionExpirationTimeDialog, {
        resolve: { permission, fetch },
      }),
    );
  };
  return canUpdatePermission ? (
    <RowActionButton
      action={callback}
      title={translate('Edit')}
      iconNode={<PencilSimple />}
      size="sm"
    />
  ) : null;
};
