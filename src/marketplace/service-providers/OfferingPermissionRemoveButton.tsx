import { Trash } from '@phosphor-icons/react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { deleteOfferingPermission } from '@waldur/permissions/api';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { RowActionButton } from '@waldur/table/ActionButton';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

interface OfferingPermissionRemoveButtonProps {
  permission: any;
  fetch;
}

export const OfferingPermissionRemoveButton: React.FC<
  OfferingPermissionRemoveButtonProps
> = (props) => {
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);
  const canDeletePermission = hasPermission(user, {
    permission: PermissionEnum.DELETE_OFFERING_PERMISSION,
    customerId: customer.uuid,
  });

  const dispatch = useDispatch();
  const callback = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate('Are you sure you want to revoke this permission?'),
      );
    } catch {
      return;
    }
    try {
      await deleteOfferingPermission({
        offering: props.permission.offering_uuid,
        user: props.permission.user_uuid,
        role: props.permission.role_name,
      });
      dispatch(showSuccess(translate('Permission has been revoked.')));
      await props.fetch();
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to revoke permission.')));
    }
  };
  return canDeletePermission ? (
    <RowActionButton
      action={callback}
      title={translate('Revoke')}
      iconNode={<Trash />}
      size="sm"
    />
  ) : null;
};
