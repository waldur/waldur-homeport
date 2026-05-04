import { Invitation, userInvitationsDelete } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useBatchMutation } from '@/modal/useBatchMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { useUser } from '@/workspace/hooks';

export const MultiDeleteAction = ({ rows, refetch }) => {
  const user = useUser();

  const { mutate, isPending } = useBatchMutation<Invitation, void>({
    rows,
    refetch,
    mutationFn: (row) => userInvitationsDelete({ path: { uuid: row.uuid } }),
    successMessage: translate('Invitations have been deleted.'),
    renderPartialSuccessMessage: (n) =>
      translate('{n} invitations have been deleted.', { n }),
    errorMessage: translate('Unable to delete invitations.'),
    renderErrorMessage: (n) =>
      translate('{n} invitations could not be deleted.', { n }),
    confirmation: {
      title: translate('Delete invitations'),
      body: translate('Are you sure you want to delete {count} invitations?', {
        count: rows.length,
      }),
      options: { forDeletion: true },
    },
  });

  const tooltip = user.is_staff
    ? translate('Delete all selected invitations.')
    : translate('You do not have permission to delete invitations.');

  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={mutate}
      disabled={!user.is_staff || isPending}
      tooltip={tooltip}
    />
  );
};
