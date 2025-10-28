import { TrashIcon } from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { adminAnnouncementsDestroy } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ADMIN_ANNOUNCEMENTS_QUERY_KEY } from '@waldur/navigation/header/announcements/queryKeys';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

export const AnnouncementDeleteAction = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const openDialog = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate('Are you sure you want to delete the announcement?'),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    await adminAnnouncementsDestroy({ path: { uuid: row.uuid } });
    await refetch();
    // Invalidate React Query cache to update announcements in header
    queryClient.invalidateQueries({
      queryKey: ADMIN_ANNOUNCEMENTS_QUERY_KEY,
    });
  };
  return (
    <ActionItem
      title={translate('Remove')}
      action={openDialog}
      iconNode={<TrashIcon weight="bold" />}
      className="text-danger"
      iconColor="danger"
      size="sm"
    />
  );
};
