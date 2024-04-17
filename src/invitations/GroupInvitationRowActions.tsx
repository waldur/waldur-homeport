import { FunctionComponent } from 'react';
import { ButtonGroup } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { GroupInvitationCancelButton } from '@waldur/invitations/GroupInvitationCancelButton';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

interface GroupInvitationRowActionsProps {
  refetch;
  row;
}

export const GroupInvitationRowActions: FunctionComponent<
  GroupInvitationRowActionsProps
> = ({ row, refetch }) => {
  const customer = useSelector(getCustomer);
  const user = useSelector(getUser);
  const canCancel = hasPermission(user, {
    permission: PermissionEnum.DELETE_CUSTOMER_PERMISSION,
    customerId: customer.uuid,
  });
  return canCancel ? (
    <ButtonGroup>
      {row.is_active && (
        <GroupInvitationCancelButton
          permissionRequest={row}
          refetch={refetch}
        />
      )}
    </ButtonGroup>
  ) : null;
};
