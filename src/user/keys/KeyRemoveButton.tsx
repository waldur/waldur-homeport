import { keysDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const KeyRemoveButton = ({ row, refetch }) => {
  const { mutate: mutate, isPending: isPending } = useManagedMutation<
    any,
    any,
    void
  >({
    mutationFn: () => keysDestroy({ path: { uuid: row.uuid } }),
    refetch: refetch,

    confirmation: {
      title: translate('Key removal'),
      body: translate('Are you sure you would like to delete the key?'),

      options: {
        forDeletion: true,
      },
    },

    successMessage: translate('SSH key has been removed.'),
    errorMessage: translate('Unable to remove SSH key.'),
  });

  return (
    <RemovalActionItem
      title={translate('Remove')}
      action={mutate}
      disabled={isPending}
    />
  );
};
