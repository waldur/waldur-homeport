import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { GroupInvitation } from 'waldur-js-client';

import { GroupInvitationEditButton } from '@/invitations/actions/GroupInvitationEditButton';
import { GroupInvitationCancelButton } from '@/invitations/GroupInvitationCancelButton';
import { GroupInvitationDeleteButton } from '@/invitations/GroupInvitationDeleteButton';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';
import { useUser } from '@/workspace/hooks';
import { getCustomer } from '@/workspace/selectors';

interface GroupInvitationRowActionsProps {
  refetch;
  row: GroupInvitation;
}

export const GroupInvitationRowActions: FunctionComponent<
  GroupInvitationRowActionsProps
> = ({ row, refetch }) => {
  const customer = useSelector(getCustomer);
  const user = useUser();
  const canCancel = hasPermission(user, {
    permission: PermissionEnum.DELETE_CUSTOMER_PERMISSION,
    customerId: customer.uuid,
  });
  return canCancel ? (
    <ActionsDropdownComponent>
      <GroupInvitationEditButton row={row} refetch={refetch} />
      <GroupInvitationCancelButton invitation={row} refetch={refetch} />
      <GroupInvitationDeleteButton row={row} refetch={refetch} />
    </ActionsDropdownComponent>
  ) : null;
};
