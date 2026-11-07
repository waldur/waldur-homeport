import { CaretDownIcon, CaretUpIcon, InfoIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, useState } from 'react';
import { AdminAnnouncement } from 'waldur-js-client';

import { IconSquare } from 'waldur-ui';

import { translate } from '@/i18n';
import { PAGE_CONTAINER_CLASSNAME } from '@/navigation/pageContainer';

import { AdminAnnouncementBar } from './AdminAnnouncementBar';

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
        <div
          className={classNames(
            PAGE_CONTAINER_CLASSNAME,
            'flex items-center gap-2.5',
          )}
        >
          <IconSquare>
            <InfoIcon weight="bold" />
          </IconSquare>
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
          <AdminAnnouncementBar
            key={announcement.uuid}
            announcement={announcement}
            onShowMore={onShowMore}
          />
        ))}
    </div>
  );
};
