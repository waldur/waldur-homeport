import { FunctionComponent } from 'react';
import { GroupInvitation, userGroupInvitationsDestroy } from 'waldur-js-client';

import { DeleteButton } from '@/core/buttons';
import { translate } from '@/i18n';

interface GroupInvitationDeleteButtonProps {
  row: GroupInvitation;
  refetch: () => void;
}

export const GroupInvitationDeleteButton: FunctionComponent<
  GroupInvitationDeleteButtonProps
> = ({ row, refetch }) => (
  <DeleteButton
    row={row}
    apiFunction={(r) => userGroupInvitationsDestroy({ path: { uuid: r.uuid } })}
    confirmTitle={translate('Delete invitation')}
    confirmMessage={translate(
      'Are you sure you would like to delete the invitation created by {name}?',
      { name: row.created_by_full_name },
    )}
    successMessage={translate('Group invitation has been deleted.')}
    errorMessage={translate('Unable to delete group invitation.')}
    refetch={refetch}
    disabled={row.is_active}
    tooltip={
      row.is_active
        ? translate('Only canceled invitations can be deleted.')
        : undefined
    }
  />
);
