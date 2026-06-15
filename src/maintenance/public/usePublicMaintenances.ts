import { useQuery } from '@tanstack/react-query';
import {
  AdminAnnouncement,
  PublicMaintenanceAnnouncement,
  publicMaintenanceAnnouncementsList,
} from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { HOUR, STALE_TIME } from '@/core/constants';
import { getUUID } from '@/core/utils';

const PUBLIC_MAINTENANCES_QUERY_KEY = [
  'publicMaintenanceAnnouncements',
] as const;

export const usePublicMaintenances = () =>
  useQuery({
    queryKey: PUBLIC_MAINTENANCES_QUERY_KEY,
    queryFn: () =>
      getAllPages<PublicMaintenanceAnnouncement>((page) =>
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
 * Filters maintenance announcements affecting a given offering.
 * Returns an empty array when no offering UUID is supplied so that
 * callers can safely render `null` based on the length of the result.
 */
export const getMaintenancesForOffering = (
  announcements: PublicMaintenanceAnnouncement[] | undefined,
  offeringUuid: string | undefined,
): PublicMaintenanceAnnouncement[] => {
  if (!announcements || !offeringUuid) return [];
  return announcements.filter((announcement) =>
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

/**
 * Adapts a `PublicMaintenanceAnnouncement` onto the shape the existing
 * `AnnouncementDetailsDialog` expects (modelled after `AdminAnnouncement`
 * + maintenance fields). This avoids touching the dialog implementation.
 */
export const toAdminAnnouncementShape = (
  maintenance: PublicMaintenanceAnnouncement,
): AdminAnnouncement => {
  const variant = getMaintenanceVariant(maintenance);
  return {
    uuid: maintenance.uuid,
    description: maintenance.message,
    type: variant,
    maintenance_uuid: maintenance.uuid,
    maintenance_name: maintenance.name,
    maintenance_type: maintenance.maintenance_type_display,
    maintenance_state: maintenance.state,
    maintenance_scheduled_start: maintenance.scheduled_start,
    maintenance_scheduled_end: maintenance.scheduled_end,
    maintenance_service_provider: maintenance.service_provider_name,
    maintenance_external_reference_url: maintenance.external_reference_url,
    maintenance_affected_offerings: (maintenance.affected_offerings || []).map(
      (entry) => ({
        uuid: entry.uuid,
        name: entry.offering_name,
        impact_level:
          typeof entry.impact_level === 'number'
            ? String(entry.impact_level)
            : undefined,
        impact_level_display: entry.impact_level_display,
        impact_description: entry.impact_description,
      }),
    ),
  };
};
