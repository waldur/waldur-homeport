import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { GroupInvitation } from 'waldur-js-client';

import { GroupInvitationCancelButton } from '@waldur/invitations/GroupInvitationCancelButton';
import { GroupInvitationDeleteButton } from '@waldur/invitations/GroupInvitationDeleteButton';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

interface GroupInvitationRowActionsProps {
  refetch;
  row: GroupInvitation;
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
    <ActionsDropdownComponent>
      <GroupInvitationCancelButton invitation={row} refetch={refetch} />
      <GroupInvitationDeleteButton row={row} refetch={refetch} />
    </ActionsDropdownComponent>
  ) : null;
};
