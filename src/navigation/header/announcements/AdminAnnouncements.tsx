import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { AdminAnnouncement, adminAnnouncementsList } from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { STALE_TIME, HOUR } from '@/core/constants';
import { lazyComponent } from '@/core/lazyComponent';
import { useModal } from '@/modal/actions';

import { AdminAnnouncementBar } from './AdminAnnouncementBar';
import { AnnouncementError } from './AnnouncementError';
import { AnnouncementGroup } from './AnnouncementGroup';
import { ADMIN_ANNOUNCEMENTS_QUERY_KEY } from './queryKeys';

// Above this count the bars are collapsed into a single expandable group.
const GROUP_THRESHOLD = 3;

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

    staleTime: STALE_TIME,

    // Keep cached data for 60 minutes
    gcTime: HOUR,

    // Retry failed requests twice before showing error
    retry: 2,

    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const { openDialog } = useModal();
  const callback = useCallback((announcement: AdminAnnouncement) => {
    openDialog(AnnouncementDetailsDialog, {
      resolve: { announcement },
      size: 'lg',
    });
  }, []);

  if (error) {
    return <AnnouncementError refetch={refetch} />;
  }

  if (isLoading || !data) return null;

  if (data.length > GROUP_THRESHOLD) {
    return <AnnouncementGroup announcements={data} onShowMore={callback} />;
  }

  return data.map((announcement) => (
    <AdminAnnouncementBar
      key={announcement.uuid}
      announcement={announcement}
      onShowMore={callback}
    />
  ));
};
