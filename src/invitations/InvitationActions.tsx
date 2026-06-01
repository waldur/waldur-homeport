import { ActionsDropdown } from '@/table/ActionsDropdown';
import { useUser } from '@/workspace/hooks';

import { InvitationCancelButton } from './actions/InvitationCancelButton';
import { InvitationSendButton } from './actions/InvitationSendButton';
import { InvitationDeleteButton } from './InvitationDeleteButton';

export const InvitationActions = ({ invitation, refetch }) => {
  const user = useUser();
  return (
    <ActionsDropdown
      row={invitation}
      refetch={refetch}
      actions={[
        InvitationSendButton,
        InvitationCancelButton,
        user.is_staff ? InvitationDeleteButton : null,
      ].filter(Boolean)}
    />
  );
};
