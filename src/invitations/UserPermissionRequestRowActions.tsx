import { FunctionComponent } from 'react';
import { ButtonGroup } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { UserPermissionRequestApproveButton } from '@waldur/invitations/UserPermissionRequestApproveButton';
import { UserPermissionRequestRejectButton } from '@waldur/invitations/UserPermissionRequestRejectButton';
import {
  getUser,
  isOwnerOrStaff as isOwnerOrStaffSelector,
} from '@waldur/workspace/selectors';

interface UserPermissionRequestRowActionsProps {
  refetch;
  row;
}

export const UserPermissionRequestRowActions: FunctionComponent<UserPermissionRequestRowActionsProps> =
  ({ row, refetch }) => {
    const user = useSelector(getUser);
    const isOwnerOrStaff = useSelector(isOwnerOrStaffSelector);
    return row.state === 'pending' && (isOwnerOrStaff || user.is_support) ? (
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
