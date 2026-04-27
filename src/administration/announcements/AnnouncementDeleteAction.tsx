import { useQueryClient } from '@tanstack/react-query';
import { adminAnnouncementsDestroy } from 'waldur-js-client';

import { DeleteButton } from '@/core/buttons';
import { translate } from '@/i18n';
import { ADMIN_ANNOUNCEMENTS_QUERY_KEY } from '@/navigation/header/announcements/queryKeys';

export const AnnouncementDeleteAction = ({ row, refetch }) => {
  const queryClient = useQueryClient();

  return (
    <DeleteButton
      row={row}
      apiFunction={(r) => adminAnnouncementsDestroy({ path: { uuid: r.uuid } })}
      refetch={refetch}
      onSuccess={() =>
        queryClient.invalidateQueries({
          queryKey: ADMIN_ANNOUNCEMENTS_QUERY_KEY,
        })
      }
      confirmTitle={translate('Confirmation')}
      confirmMessage={translate(
        'Are you sure you want to delete the announcement?',
      )}
      title={translate('Remove')}
    />
  );
};
