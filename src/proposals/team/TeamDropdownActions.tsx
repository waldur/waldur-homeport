import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';

import { InvitationCreateButton } from '@/invitations/actions/create/InvitationCreateButton';
import { GenericInvitationContext } from '@/invitations/types';
import { AddDropdownToggle } from '@/table/ActionsDropdown';

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
    <RadixDropdownMenu.Root modal={false}>
      <RadixDropdownMenu.Trigger asChild>
        <AddDropdownToggle />
      </RadixDropdownMenu.Trigger>
      <RadixDropdownMenu.Portal>
        <RadixDropdownMenu.Content
          align="start"
          sideOffset={2}
          className="dropdown-menu show position-static"
        >
          {canInvite === false ? null : (
            <InvitationCreateButton
              refetch={refetchInvitations}
              canInvite={canInvite}
              {...rest}
            />
          )}
          <AddUserButton
            refetch={refetchUsers}
            canAddUser={canAddUser}
            {...rest}
          />
        </RadixDropdownMenu.Content>
      </RadixDropdownMenu.Portal>
    </RadixDropdownMenu.Root>
  );
};
