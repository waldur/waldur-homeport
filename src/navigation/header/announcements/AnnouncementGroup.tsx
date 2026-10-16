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
    <div className="print:hidden">
      <button
        type="button"
        className="flex min-h-[55px] w-full items-center border-b border-secondary bg-primary p-0 text-inherit"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
      >
        <div className="container-fluid flex items-center gap-3">
          <div className="icon-square">
            <InfoIcon weight="bold" />
          </div>
          <div className="grow text-start">
            <strong className="font-medium block text-sm">
              {translate('{count} announcements', {
                count: announcements.length,
              })}
            </strong>
            <span className="text-quaternary text-sm">
              {translate('Planned maintenance windows and service updates')}
            </span>
          </div>
          {expanded ? (
            <CaretUpIcon weight="bold" size={20} className="text-quaternary" />
          ) : (
            <CaretDownIcon
              weight="bold"
              size={20}
              className="text-quaternary"
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
