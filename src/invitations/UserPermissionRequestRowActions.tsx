import { FunctionComponent } from 'react';
import { ButtonGroup } from 'react-bootstrap';

import { UserPermissionRequestApproveButton } from '@waldur/invitations/UserPermissionRequestApproveButton';
import { UserPermissionRequestRejectButton } from '@waldur/invitations/UserPermissionRequestRejectButton';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { useUser } from '@waldur/workspace/hooks';

interface UserPermissionRequestRowActionsProps {
  refetch;
  row;
}

export const UserPermissionRequestRowActions: FunctionComponent<
  UserPermissionRequestRowActionsProps
> = ({ row, refetch }) => {
  const user = useUser();
  let canManageRequest = false;
  // Check if the user has permission to manage the request based on the role name
  if (row.role_name.startsWith('PROJECT.')) {
    canManageRequest = hasPermission(user, {
      permission: PermissionEnum.CREATE_PROJECT_PERMISSION,
      projectId: row.scope_uuid,
    });
  } else if (row.role_name.startsWith('CUSTOMER.')) {
    canManageRequest = hasPermission(user, {
      permission: PermissionEnum.CREATE_CUSTOMER_PERMISSION,
      customerId: row.scope_uuid,
    });
  }

  return row.state === 'pending' && canManageRequest ? (
    <ButtonGroup>
      <UserPermissionRequestApproveButton
        permissionRequest={row}
        refetch={refetch}
      />

      <UserPermissionRequestRejectButton
        permissionRequest={row}
        refetch={refetch}
      />
    </ButtonGroup>
  ) : null;
};
