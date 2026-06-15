import { WarningCircleIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import { PublicMaintenanceAnnouncement } from 'waldur-js-client';

import { formatMediumDateTime } from '@/core/dateUtils';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { AnnouncementBar } from '@/navigation/header/announcements/AnnouncementBar';

import {
  getMaintenancesForOffering,
  getMaintenanceVariant,
  usePublicMaintenances,
} from './usePublicMaintenances';

const AnnouncementDetailsDialog = lazyComponent(() =>
  import('@/navigation/header/announcements/AnnouncementDetailsDialog').then(
    (module) => ({
      default: module.AnnouncementDetailsDialog,
    }),
  ),
);

interface Props {
  offeringUuid?: string;
}

const buildDescription = (maintenance: PublicMaintenanceAnnouncement) => {
  const providerPrefix = maintenance.service_provider_name
    ? `${maintenance.service_provider_name}: `
    : '';
  const window =
    maintenance.scheduled_start && maintenance.scheduled_end
      ? ` (${translate('Scheduled {start} – {end}', {
          start: formatMediumDateTime(maintenance.scheduled_start),
          end: formatMediumDateTime(maintenance.scheduled_end),
        })})`
      : '';
  return `${providerPrefix}${maintenance.message}${window}`;
};

export const PublicMaintenanceCard: FC<Props> = ({ offeringUuid }) => {
  const { data } = usePublicMaintenances();
  const { openDialog } = useModal();

  const openDetails = useCallback(
    (maintenance: PublicMaintenanceAnnouncement) => {
      openDialog(AnnouncementDetailsDialog, {
        resolve: { announcement: maintenance },
        size: 'lg',
      });
    },
    [openDialog],
  );

  const matches = getMaintenancesForOffering(data, offeringUuid);
  if (matches.length === 0) return null;

  return (
    <>
      {matches.map((maintenance) => (
        <AnnouncementBar
          key={maintenance.uuid}
          label={translate('Maintenance ({type})', {
            type: maintenance.maintenance_type_display,
          })}
          description={buildDescription(maintenance)}
          icon={WarningCircleIcon}
          variant={getMaintenanceVariant(maintenance)}
          colored
          hasColon
          onShowMore={() => openDetails(maintenance)}
        />
      ))}
    </>
  );
};
