import { PencilSimpleIcon } from '@phosphor-icons/react';
import React from 'react';
import { useSelector } from 'react-redux';
import { CustomerUser } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';
import { getCustomer } from '@/workspace/selectors';

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
  const { openDialog } = useModal();
  const user = useUser();
  const currentCustomer = useSelector(getCustomer);
  const callback = () =>
    openDialog(EditUserDialog, {
      resolve: {
        customer,
        refetch,
      },
    });
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
