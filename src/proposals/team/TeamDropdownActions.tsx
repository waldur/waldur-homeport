import { InvitationCreateButton } from '@/invitations/actions/create/InvitationCreateButton';
import { GenericInvitationContext } from '@/invitations/types';
import { ActionsMenu } from '@/table/ActionsDropdown';

import { AddUserButton } from './AddUserButton';

interface TeamDropdownActionsProps extends GenericInvitationContext {
  refetchUsers?(): void;
  refetchInvitations?(): void;
  /** Overrides who may add a member, see AddUserButton. */
  canAddUser?: boolean;
  /** Overrides who may invite by mail; false leaves the item out. */
  canInvite?: boolean;
}

export const TeamDropdownActions = ({
  refetchUsers,
  refetchInvitations,
  canAddUser,
  canInvite,
  ...rest
}: TeamDropdownActionsProps) => {
  return (
    <ActionsMenu side="bottom" toggle="add" align="start">
      {canInvite === false ? null : (
        <InvitationCreateButton
          refetch={refetchInvitations}
          canInvite={canInvite}
          {...rest}
        />
      )}
      <AddUserButton refetch={refetchUsers} canAddUser={canAddUser} {...rest} />
    </ActionsMenu>
  );
};
