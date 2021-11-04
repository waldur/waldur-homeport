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
  refreshList;
  row;
}

export const UserPermissionRequestRowActions: FunctionComponent<UserPermissionRequestRowActionsProps> =
  ({ row, refreshList }) => {
    const user = useSelector(getUser);
    const isOwnerOrStaff = useSelector(isOwnerOrStaffSelector);
    return row.state === 'pending' && (isOwnerOrStaff || user.is_support) ? (
      <ButtonGroup>
        <UserPermissionRequestApproveButton
          permissionRequest={row}
          refreshList={refreshList}
        />
        <UserPermissionRequestRejectButton
          permissionRequest={row}
          refreshList={refreshList}
        />
      </ButtonGroup>
    ) : null;
  };
