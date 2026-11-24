import { useQuery } from '@tanstack/react-query';
import { adminAnnouncementsList } from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { HOUR, STALE_TIME } from '@/core/constants';
import { useUser } from '@/workspace/hooks';

import { ADMIN_ANNOUNCEMENTS_QUERY_KEY } from './queryKeys';

export const useActiveAdminAnnouncements = () => {
  const isSignedIn = Boolean(useUser());
  return useQuery({
    // Signed-out visitors get only the announcements published to them; a
    // separate entry keeps that shorter list from being reused after login.
    queryKey: [
      ...ADMIN_ANNOUNCEMENTS_QUERY_KEY,
      isSignedIn ? 'signed-in' : 'anonymous',
    ],

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
};
