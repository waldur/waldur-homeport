import { FunctionComponent } from 'react';
import { userPermissionRequestsCancelRequest } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

interface UserPermissionRequestDeleteButtonProps {
  row: any;
  refetch: () => void;
}

export const UserPermissionRequestDeleteButton: FunctionComponent<
  UserPermissionRequestDeleteButtonProps
> = ({ row, refetch }) => {
  const { mutate: mutate, isPending: isPending } = useManagedMutation<
    any,
    any,
    void
  >({
    mutationFn: () =>
      userPermissionRequestsCancelRequest({ path: { uuid: row.uuid } }),
    refetch: refetch,

    confirmation: {
      title: translate('Delete permission request'),

      body: translate(
        'Are you sure you would like to delete the permission request by {name}?',
        { name: row.created_by_full_name },
      ),

      options: {
        forDeletion: true,
      },
    },

    successMessage: translate('Permission request has been deleted.'),
    errorMessage: translate('Unable to delete permission request.'),
  });

  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={mutate}
      disabled={isPending}
    />
  );
};
