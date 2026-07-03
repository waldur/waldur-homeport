import { useQuery } from '@tanstack/react-query';
import {
  PublicMaintenanceAnnouncement,
  publicMaintenanceAnnouncementsList,
} from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { HOUR, STALE_TIME } from '@/core/constants';
import { parseDate } from '@/core/dateUtils';
import { getUUID } from '@/core/utils';

const PUBLIC_MAINTENANCES_QUERY_KEY = [
  'publicMaintenanceAnnouncements',
] as const;

export const usePublicMaintenances = () =>
  useQuery({
    queryKey: PUBLIC_MAINTENANCES_QUERY_KEY,
    queryFn: () =>
      getAllPages((page) =>
        publicMaintenanceAnnouncementsList({
          query: {
            state: ['Scheduled', 'In progress'],
            page,
            page_size: MAX_PAGE_SIZE,
          },
        }),
      ),
    staleTime: STALE_TIME,
    gcTime: HOUR,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 2,
  });

/**
 * A maintenance is only worth surfacing to end users while its window is
 * current or still ahead. Announcements left in Scheduled/In progress after
 * their window has already elapsed (e.g. "Maintenance 10 months ago") are
 * stale and hidden.
 */
export const isCurrentOrUpcoming = (
  maintenance: PublicMaintenanceAnnouncement,
): boolean => {
  if (!maintenance.scheduled_end) return true;
  return parseDate(maintenance.scheduled_end).toMillis() >= Date.now();
};

/**
 * Filters maintenance announcements affecting a given offering, keeping only
 * those whose window is current or upcoming.
 * Returns an empty array when no offering UUID is supplied so that
 * callers can safely render `null` based on the length of the result.
 */
export const getMaintenancesForOffering = (
  announcements: PublicMaintenanceAnnouncement[] | undefined,
  offeringUuid: string | undefined,
): PublicMaintenanceAnnouncement[] => {
  if (!announcements || !offeringUuid) return [];
  return announcements.filter(
    (announcement) =>
      isCurrentOrUpcoming(announcement) &&
      announcement.affected_offerings?.some(
        (entry) => entry.offering && getUUID(entry.offering) === offeringUuid,
      ),
  );
};

/**
 * Maps the public maintenance type display string to the announcement
 * variant used by the existing UI helpers (icon + colour).
 */
export const getMaintenanceVariant = (
  maintenance: PublicMaintenanceAnnouncement,
): 'danger' | 'warning' => {
  // Emergency = 2, Security = 3 per MAINTENANCE_TYPE
  return maintenance.maintenance_type === 2 ||
    maintenance.maintenance_type === 3
    ? 'danger'
    : 'warning';
};
