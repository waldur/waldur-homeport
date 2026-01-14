import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { adminAnnouncementsList } from 'waldur-js-client';

import {
  ANNOUNCEMENT_ICON,
  getAnnouncementTypeLabel,
} from '@waldur/administration/utils';
import { getAllPages, MAX_PAGE_SIZE } from '@waldur/core/api';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

import { AnnouncementBar } from './AnnouncementBar';
import { AnnouncementError } from './AnnouncementError';
import { ADMIN_ANNOUNCEMENTS_QUERY_KEY } from './queryKeys';

const AnnouncementDetailsDialog = lazyComponent(() =>
  import('./AnnouncementDetailsDialog').then((module) => ({
    default: module.AnnouncementDetailsDialog,
  })),
);

export const AdminAnnouncements = () => {
  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ADMIN_ANNOUNCEMENTS_QUERY_KEY,

    queryFn: () =>
      getAllPages((page) =>
        adminAnnouncementsList({
          query: { page, page_size: MAX_PAGE_SIZE, is_active: true },
        }),
      ),

    staleTime: 1000 * 60 * 5,

    // Keep cached data for 60 minutes
    gcTime: 1000 * 60 * 60,

    // Retry failed requests twice before showing error
    retry: 2,

    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const dispatch = useDispatch();
  const callback = useCallback((announcement) => {
    dispatch(
      openModalDialog(AnnouncementDetailsDialog, {
        resolve: { announcement },
        size: 'lg',
      }),
    );
  }, []);

  if (error) {
    return <AnnouncementError refetch={refetch} />;
  }

  if (isLoading || !data) return null;

  return data.map((announcement) => (
    <AnnouncementBar
      key={announcement.uuid}
      label={getAnnouncementTypeLabel(announcement.type)}
      description={announcement.description}
      icon={ANNOUNCEMENT_ICON[announcement.type].icon}
      variant={ANNOUNCEMENT_ICON[announcement.type].variant}
      ellipsis
      onShowMore={() => callback(announcement)}
      hasColon
    />
  ));
};
