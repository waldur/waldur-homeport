import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';

import { InvitationCreateButton } from '@/invitations/actions/create/InvitationCreateButton';
import { GenericInvitationContext } from '@/invitations/types';
import { AddDropdownToggle } from '@/table/ActionsDropdown';

import { AddUserButton } from './AddUserButton';

interface TeamDropdownActionsProps extends GenericInvitationContext {
  refetchUsers?(): void;
  refetchInvitations?(): void;
}

export const TeamDropdownActions = ({
  refetchUsers,
  refetchInvitations,
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
          <InvitationCreateButton refetch={refetchInvitations} {...rest} />
          <AddUserButton refetch={refetchUsers} {...rest} />
        </RadixDropdownMenu.Content>
      </RadixDropdownMenu.Portal>
    </RadixDropdownMenu.Root>
  );
};
