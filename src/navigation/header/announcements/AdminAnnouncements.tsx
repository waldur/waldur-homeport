import { useCallback } from 'react';
import { AdminAnnouncement } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { useModal } from '@/modal/actions';

import { AdminAnnouncementBar } from './AdminAnnouncementBar';
import { AnnouncementError } from './AnnouncementError';
import { AnnouncementGroup } from './AnnouncementGroup';
import { useActiveAdminAnnouncements } from './useActiveAdminAnnouncements';

// Above this count the bars are collapsed into a single expandable group.
const GROUP_THRESHOLD = 3;

const AnnouncementDetailsDialog = lazyComponent(() =>
  import('./AnnouncementDetailsDialog').then((module) => ({
    default: module.AnnouncementDetailsDialog,
  })),
);

interface AdminAnnouncementsProps {
  /** Tint warning and danger bars in their colour. */
  colored?: boolean;
  /** Render nothing when loading fails instead of a retry prompt. */
  hideError?: boolean;
}

export const AdminAnnouncements = ({
  colored,
  hideError,
}: AdminAnnouncementsProps) => {
  const { isLoading, error, data, refetch } = useActiveAdminAnnouncements();

  const { openDialog } = useModal();
  const callback = useCallback((announcement: AdminAnnouncement) => {
    openDialog(AnnouncementDetailsDialog, {
      resolve: { announcement },
      size: 'lg',
    });
  }, []);

  if (error) {
    return hideError ? null : <AnnouncementError refetch={refetch} />;
  }

  if (isLoading || !data) return null;

  if (data.length > GROUP_THRESHOLD) {
    return (
      <AnnouncementGroup
        announcements={data}
        onShowMore={callback}
        colored={colored}
      />
    );
  }

  return data.map((announcement) => (
    <AdminAnnouncementBar
      key={announcement.uuid}
      announcement={announcement}
      onShowMore={callback}
      colored={colored}
    />
  ));
};
