import { ClockCountdownIcon, WrenchIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { PublicMaintenanceAnnouncement } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { formatMediumDateTime, formatRelative } from '@/core/dateUtils';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';

import {
  getMaintenancesForOffering,
  usePublicMaintenances,
} from './usePublicMaintenances';

interface Props {
  offeringUuid?: string;
}

const buildTooltip = (maintenance: PublicMaintenanceAnnouncement) => {
  const parts: string[] = [];
  if (maintenance.maintenance_type_display) {
    parts.push(
      translate('Type: {type}', {
        type: maintenance.maintenance_type_display,
      }),
    );
  }
  if (maintenance.scheduled_start && maintenance.scheduled_end) {
    parts.push(
      translate('Window: {start} – {end}', {
        start: formatMediumDateTime(maintenance.scheduled_start),
        end: formatMediumDateTime(maintenance.scheduled_end),
      }),
    );
  }
  if (maintenance.service_provider_name) {
    parts.push(
      translate('Provider: {provider}', {
        provider: maintenance.service_provider_name,
      }),
    );
  }
  return parts.join(' · ');
};

const MaintenanceBadge: FC<{ maintenance: PublicMaintenanceAnnouncement }> = ({
  maintenance,
}) => {
  const isInProgress = maintenance.state === 'In progress';
  const variant = isInProgress ? 'warning' : 'info';
  const icon = isInProgress ? (
    <WrenchIcon weight="bold" />
  ) : (
    <ClockCountdownIcon weight="bold" />
  );
  const label = isInProgress
    ? translate('Maintenance in progress')
    : translate('Maintenance {when}', {
        when: formatRelative(maintenance.scheduled_start),
      });

  return (
    <Tip
      id={`public-maintenance-${maintenance.uuid}`}
      label={buildTooltip(maintenance)}
    >
      <Badge variant={variant} size="sm" leftIcon={icon} pill outline>
        {label}
      </Badge>
    </Tip>
  );
};

export const PublicMaintenanceBadge: FC<Props> = ({ offeringUuid }) => {
  const { data } = usePublicMaintenances();
  const matches = getMaintenancesForOffering(data, offeringUuid);
  if (matches.length === 0) return null;
  return (
    <>
      {matches.map((maintenance) => (
        <MaintenanceBadge key={maintenance.uuid} maintenance={maintenance} />
      ))}
    </>
  );
};
