import { GenericInvitationContext } from '@/invitations/types';

export interface AddUserDialogProps extends GenericInvitationContext {
  refetch;
  /** Opens the invitation dialog; offered when no user matches the search. */
  onInviteByMail?(): void;
}
