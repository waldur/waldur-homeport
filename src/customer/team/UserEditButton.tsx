import { PencilSimpleIcon } from '@phosphor-icons/react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CustomerUser } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

const EditUserDialog = lazyComponent(() =>
  import('./EditUserDialog').then((module) => ({
    default: module.EditUserDialog,
  })),
);

interface UserEditButtonProps {
  customer: CustomerUser;
  refetch;
}

export const UserEditButton: React.FC<UserEditButtonProps> = ({
  customer,
  refetch,
}) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const currentCustomer = useSelector(getCustomer);
  const callback = () =>
    dispatch(
      openModalDialog(EditUserDialog, {
        resolve: {
          customer,
          refetch,
        },
      }),
    );
  if (
    !hasPermission(user, {
      permission: PermissionEnum.UPDATE_CUSTOMER_PERMISSION,
      customerId: currentCustomer.uuid,
    })
  ) {
    return null;
  }
  return (
    <ActionItem
      title={translate('Edit')}
      action={callback}
      iconNode={<PencilSimpleIcon weight="bold" />}
    />
  );
};
