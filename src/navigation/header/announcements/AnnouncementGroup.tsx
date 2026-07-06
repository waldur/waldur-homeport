import { CaretDownIcon, CaretUpIcon, InfoIcon } from '@phosphor-icons/react';
import { FC, useState } from 'react';
import { AdminAnnouncement } from 'waldur-js-client';

import { ANNOUNCEMENT_ICON } from '@/administration/utils';
import { translate } from '@/i18n';

import { AnnouncementBar } from './AnnouncementBar';

interface AnnouncementGroupProps {
  announcements: AdminAnnouncement[];
  onShowMore: (announcement: AdminAnnouncement) => void;
}

export const AnnouncementGroup: FC<AnnouncementGroupProps> = ({
  announcements,
  onShowMore,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="announcement-group d-print-none">
      <button
        type="button"
        className="announcement-group-header bar bg-body w-100 p-0 d-flex align-items-center"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
      >
        <div className="container-fluid d-flex align-items-center gap-3">
          <div className="icon-square">
            <InfoIcon weight="bold" />
          </div>
          <div className="flex-grow-1 text-start">
            <strong className="fw-bold d-block fs-6">
              {translate('{count} announcements', {
                count: announcements.length,
              })}
            </strong>
            <span className="text-muted fs-6">
              {translate('Planned maintenance windows and service updates')}
            </span>
          </div>
          {expanded ? (
            <CaretUpIcon
              weight="bold"
              size={20}
              className="announcement-group-caret"
            />
          ) : (
            <CaretDownIcon
              weight="bold"
              size={20}
              className="announcement-group-caret"
            />
          )}
        </div>
      </button>

      {expanded &&
        announcements.map((announcement) => (
          <AnnouncementBar
            key={announcement.uuid}
            title={announcement.maintenance_name || undefined}
            provider={announcement.maintenance_service_provider || undefined}
            description={announcement.description}
            icon={ANNOUNCEMENT_ICON[announcement.type].icon}
            variant={ANNOUNCEMENT_ICON[announcement.type].variant}
            ellipsis
            onShowMore={() => onShowMore(announcement)}
          />
        ))}
    </div>
  );
};
