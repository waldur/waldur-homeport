import { userInvitationsDelete } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const InvitationDeleteButton = ({ row, refetch }) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () => userInvitationsDelete({ path: { uuid: row.uuid } }),
    refetch,
    successMessage: translate('Invitation has been deleted.'),
    errorMessage: translate('Unable to delete invitation.'),
  });

  return (
    <RemovalActionItem
      action={mutate}
      title={translate('Delete')}
      disabled={isPending}
    />
  );
};
