import { FC } from 'react';
import { AdminAnnouncement } from 'waldur-js-client';

import { ANNOUNCEMENT_ICON } from '@/administration/utils';
import { translate } from '@/i18n';

import { AnnouncementBar } from './AnnouncementBar';

const MAX_LISTED_OFFERINGS = 2;

/**
 * Names the affected offerings, which users know, rather than the issuing
 * provider, which they often don't. The provider is the fallback when the
 * maintenance lists no offerings.
 */
export const getMaintenanceByline = (
  announcement: AdminAnnouncement,
): string | undefined => {
  const names = (announcement.maintenance_affected_offerings ?? [])
    .map((offering) => offering.name)
    .filter(Boolean);
  if (names.length > MAX_LISTED_OFFERINGS) {
    return translate('Affects {offerings} and {count} more', {
      offerings: names.slice(0, MAX_LISTED_OFFERINGS).join(', '),
      count: names.length - MAX_LISTED_OFFERINGS,
    });
  }
  if (names.length) {
    return translate('Affects {offerings}', { offerings: names.join(', ') });
  }
  if (announcement.maintenance_service_provider) {
    return translate('By {provider}', {
      provider: announcement.maintenance_service_provider,
    });
  }
  return undefined;
};

export const AdminAnnouncementBar: FC<{
  announcement: AdminAnnouncement;
  onShowMore: (announcement: AdminAnnouncement) => void;
}> = ({ announcement, onShowMore }) => (
  <AnnouncementBar
    title={announcement.maintenance_name || undefined}
    byline={getMaintenanceByline(announcement)}
    description={announcement.description}
    icon={ANNOUNCEMENT_ICON[announcement.type].icon}
    variant={ANNOUNCEMENT_ICON[announcement.type].variant}
    ellipsis
    onShowMore={() => onShowMore(announcement)}
    // The message already carries the schedule; only the affected offerings'
    // impact is unique to the dialog.
    hasMoreDetails={Boolean(
      announcement.maintenance_affected_offerings?.length,
    )}
  />
);
