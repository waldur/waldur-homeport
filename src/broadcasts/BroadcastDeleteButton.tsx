import { FunctionComponent } from 'react';
import { broadcastMessagesDestroy } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const BroadcastDeleteButton: FunctionComponent<{ row; refetch }> = ({
  row,
  refetch,
}) => {
  const { mutate: mutate, isPending: isPending } = useManagedMutation<
    any,
    any,
    void
  >({
    mutationFn: () => broadcastMessagesDestroy({ path: { uuid: row.uuid } }),
    refetch: refetch,

    confirmation: {
      title: translate('Delete broadcast'),

      body: translate(
        'Are you sure you would like to delete broadcast {broadcast}?',
        { broadcast: <strong>{row.subject}</strong> },
        formatJsxTemplate,
      ),

      options: {
        forDeletion: true,
      },
    },

    successMessage: translate('Broadcast has been deleted.'),
    errorMessage: translate('Unable to delete broadcast.'),
  });

  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={mutate}
      disabled={isPending}
    />
  );
};
