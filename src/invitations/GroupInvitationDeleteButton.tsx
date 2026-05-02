import { FunctionComponent } from 'react';
import { GroupInvitation, userGroupInvitationsDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

interface GroupInvitationDeleteButtonProps {
  row: GroupInvitation;
  refetch: () => void;
}

export const GroupInvitationDeleteButton: FunctionComponent<
  GroupInvitationDeleteButtonProps
> = ({ row, refetch }) => {
  const { mutate: mutate, isPending: isPending } = useManagedMutation<
    any,
    any,
    void
  >({
    mutationFn: () => userGroupInvitationsDestroy({ path: { uuid: row.uuid } }),
    refetch: refetch,

    confirmation: {
      title: translate('Delete invitation'),

      body: translate(
        'Are you sure you would like to delete the invitation created by {name}?',
        { name: row.created_by_full_name },
      ),

      options: {
        forDeletion: true,
      },
    },

    successMessage: translate('Group invitation has been deleted.'),
    errorMessage: translate('Unable to delete group invitation.'),
  });

  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={mutate}
      disabled={row.is_active || isPending}
      tooltip={
        row.is_active
          ? translate('Only canceled invitations can be deleted.')
          : undefined
      }
    />
  );
};
