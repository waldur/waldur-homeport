import { ButtonVariant } from 'waldur-ui';

import { InvitationCreateButton } from '@/invitations/actions/create/InvitationCreateButton';
import { useCreateInvitation } from '@/invitations/actions/useCreateInvitation';
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
  /** The Add button's look; the primary one unless adding is an exception. */
  variant?: ButtonVariant;
  /** Asked before adding or inviting; nothing opens unless it resolves to
   * true. */
  beforeOpen?: () => Promise<boolean>;
}

export const TeamDropdownActions = ({
  refetchUsers,
  refetchInvitations,
  canAddUser,
  canInvite,
  variant,
  beforeOpen,
  ...rest
}: TeamDropdownActionsProps) => {
  // The member picker only finds users the current user can already see, so
  // it points whoever may invite to the invitation dialog instead.
  const invitation = useCreateInvitation({
    refetch: refetchInvitations,
    ...rest,
  });
  const mayInvite = canInvite ?? invitation.canInvite;
  return (
    <ActionsMenu side="bottom" toggle="add" variant={variant} align="start">
      {canInvite === false ? null : (
        <InvitationCreateButton
          refetch={refetchInvitations}
          canInvite={canInvite}
          beforeOpen={beforeOpen}
          {...rest}
        />
      )}
      <AddUserButton
        refetch={refetchUsers}
        canAddUser={canAddUser}
        // Already confirmed on the way into the member dialog.
        onInviteByMail={mayInvite ? invitation.callback : undefined}
        beforeOpen={beforeOpen}
        {...rest}
      />
    </ActionsMenu>
  );
};
