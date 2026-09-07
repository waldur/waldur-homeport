import { FunctionComponent } from 'react';
import { User, usersDestroy } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { useUser } from '@/workspace/hooks';

/**
 * Row action for the staff Users table. Reuses the same confirm dialog and
 * endpoint as the profile's Termination tab, but refreshes the table in place
 * instead of routing away. Staff only, and never offered for the current
 * user's own row.
 */
export const UserDeleteButton: FunctionComponent<{
  row: User;
  refetch?(): void;
}> = ({ row, refetch }) => {
  const currentUser = useUser();

  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () => usersDestroy({ path: { uuid: row.uuid } }),
    successMessage: translate('User has been deleted.'),
    errorMessage: translate('Unable to delete user.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Are you sure you want to delete {name}? This action cannot be undone.',
        { name: <strong>{row.full_name || row.username}</strong> },
        formatJsxTemplate,
      ),
      options: { forDeletion: true },
    },
  });

  if (!currentUser?.is_staff || currentUser.uuid === row.uuid) {
    return null;
  }

  // Another staff account is deletable, but not from a row menu: the deletion
  // is immediate and unrecoverable, and getting the wrong row here would take
  // the last administrator with it. The profile's Termination tab still does
  // it, with the whole account in front of you.
  const isStaffTarget = Boolean(row.is_staff);

  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={mutate}
      disabled={isPending || isStaffTarget}
      tooltip={
        isStaffTarget
          ? translate(
              'Staff accounts can only be deleted from the user profile.',
            )
          : isPending
            ? translate('Deletion in progress')
            : undefined
      }
      staff
      size="sm"
    />
  );
};
