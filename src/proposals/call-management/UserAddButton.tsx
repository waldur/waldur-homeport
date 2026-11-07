import { FunctionComponent } from 'react';

import { AddButton } from '@/core/AddButton';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { getPermissionDisabledTooltip } from '@/permissions/utils';
import { useUser, useCustomer } from '@/workspace/hooks';

interface UserAddButtonProps {
  refetch;
}

const AddUserDialog = lazyComponent(() =>
  import('@/project/team/AddUserDialog').then((module) => ({
    default: module.AddUserDialog,
  })),
);

/**
 * Whether the user may grant or revoke roles on the organisation's call
 * management: the server asks for CALL.CREATE_PERMISSION (or DELETE) on the
 * organisation, held by its owners, or on its call management, held by its
 * call organisers.
 */
export const canManageCallOrganisers = (
  user,
  customer,
  permission: string,
): boolean =>
  hasPermission(user, {
    permission,
    customerId: customer.uuid,
    callOrganizerId: customer.call_managing_organization_uuid,
  });

export const UserAddButton: FunctionComponent<UserAddButtonProps> = ({
  refetch,
}) => {
  const { openDialog } = useModal();
  const user = useUser();
  const customer = useCustomer();
  const canAddUser = canManageCallOrganisers(
    user,
    customer,
    PermissionEnum.CREATE_CALL_PERMISSION,
  );
  return (
    <AddButton
      action={() =>
        openDialog(AddUserDialog, {
          refetch,
          level: 'call_organizer',
          title: translate('Add member'),
        })
      }
      disabled={!canAddUser}
      tooltip={
        canAddUser
          ? undefined
          : getPermissionDisabledTooltip(
              PermissionEnum.CREATE_CALL_PERMISSION,
              ['customer', 'call_organizer'],
            )
      }
    />
  );
};
