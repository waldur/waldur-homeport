import { FunctionComponent } from 'react';

import { UserPermissionRequestApproveButton } from '@/invitations/UserPermissionRequestApproveButton';
import { UserPermissionRequestRejectButton } from '@/invitations/UserPermissionRequestRejectButton';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { useUser } from '@/workspace/hooks';

import { UserPermissionRequestDeleteButton } from './UserPermissionRequestDeleteButton';
import { UserPermissionRequestReviewButton } from './UserPermissionRequestReviewButton';

interface UserPermissionRequestRowActionsProps {
  fetch;
  row;
}

export const UserPermissionRequestRowActions: FunctionComponent<
  UserPermissionRequestRowActionsProps
> = ({ row, fetch: refetch }) => {
  const user = useUser();
  let canManageRequest = false;
  // Check if the user has permission to manage the request based on the role name
  if (row.role_name.startsWith('PROJECT.')) {
    canManageRequest = hasPermission(user, {
      permission: PermissionEnum.CREATE_PROJECT_PERMISSION,
      projectId: row.scope_uuid,
      customerId: row.customer_uuid,
    });
  } else if (row.role_name.startsWith('CUSTOMER.')) {
    canManageRequest = hasPermission(user, {
      permission: PermissionEnum.CREATE_CUSTOMER_PERMISSION,
      customerId: row.scope_uuid,
    });
  }

  const actionable = row.state === 'pending' && canManageRequest;

  const actions = actionable
    ? [
        UserPermissionRequestReviewButton,
        UserPermissionRequestApproveButton,
        UserPermissionRequestRejectButton,
      ]
    : [UserPermissionRequestReviewButton];

  if (user.is_staff) {
    actions.push(UserPermissionRequestDeleteButton);
  }

  return (
    <ActionsDropdown
      row={row}
      refetch={refetch}
      data={{ readOnly: !actionable && !user.is_staff }}
      actions={actions}
    />
  );
};
