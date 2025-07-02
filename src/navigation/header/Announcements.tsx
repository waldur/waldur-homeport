import {
  InfoIcon,
  WarningCircleIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { Button } from 'react-bootstrap';
import { adminAnnouncementsList } from 'waldur-js-client';

import { AnnouncementTypeOptions } from '@waldur/administration/utils';
import { getAllPages } from '@waldur/core/api';
import { RadarIcon } from '@waldur/core/RadarIcon';
import { translate } from '@waldur/i18n';

const ANNOUNCEMENT_ICON = {
  warning: {
    icon: WarningCircleIcon,
    variant: 'warning',
  },
  danger: {
    icon: XCircleIcon,
    variant: 'danger',
  },
  information: {
    icon: InfoIcon,
    variant: 'dark',
  },
};

const getTypeLabel = (type) =>
  AnnouncementTypeOptions.find((op) => op.value === type)?.label || type;

export const Announcements = () => {
  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ['adminAnnouncements'],

    queryFn: () =>
      getAllPages(() => adminAnnouncementsList({ query: { is_active: true } })),

    staleTime: 1000 * 60 * 5,

    // Keep cached data for 60 minutes
    gcTime: 1000 * 60 * 60,

    // Retry failed requests twice before showing error
    retry: 2,

    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  if (error) {
    return (
      <div className="bar bar-warning">
        <div>
          <p>
            {translate('Unable to load announcements')}
            <Button variant="text" onClick={() => refetch()}>
              {translate('Retry')}
            </Button>
          </p>
        </div>
      </div>
    );
  }

  if (isLoading || !data) return null;

  return (
    <>
      {data.map((announcement) => (
        <div key={announcement.uuid} className="bar bg-body border-bottom">
          <div className="container-fluid w-100 d-flex align-items-center gap-2">
            <RadarIcon
              IconComponent={ANNOUNCEMENT_ICON[announcement.type].icon}
              variant={ANNOUNCEMENT_ICON[announcement.type].variant}
              size="sm"
            />

            <p className="text-start fs-7">
              <strong className="fw-bold">
                {getTypeLabel(announcement.type)}
                {': '}
              </strong>
              <span className="text-muted">{announcement.description}</span>
            </p>
          </div>
        </div>
      ))}
    </>
  );
};
