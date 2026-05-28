import { adminAnnouncementsDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ADMIN_ANNOUNCEMENTS_QUERY_KEY } from '@/navigation/header/announcements/queryKeys';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const AnnouncementDeleteAction = ({ row, refetch }) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () => adminAnnouncementsDestroy({ path: { uuid: row.uuid } }),
    refetch,
    invalidateQueries: [
      {
        queryKey: ADMIN_ANNOUNCEMENTS_QUERY_KEY,
      },
    ],
    confirmation: {
      title: translate('Confirmation'),
      body: translate('Are you sure you want to delete the announcement?'),
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
