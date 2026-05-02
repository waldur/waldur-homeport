import { externalLinksDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

import { SHORTCUTS_QUERY_KEY } from './utils';

export const QuickShortcutDeleteAction = ({ row, refetch }) => {
  const { mutate: mutate, isPending: isPending } = useManagedMutation<
    any,
    any,
    void
  >({
    mutationFn: () => externalLinksDestroy({ path: { uuid: row.uuid } }),
    refetch: refetch,
    invalidateQueries: [{ queryKey: SHORTCUTS_QUERY_KEY }],

    confirmation: {
      title: translate('Confirmation'),

      body: translate('Are you sure you want to delete the shortcut?'),

      options: {
        forDeletion: true,
      },
    },
  });

  return (
    <RemovalActionItem
      title={translate('Remove')}
      action={mutate}
      disabled={isPending}
    />
  );
};
