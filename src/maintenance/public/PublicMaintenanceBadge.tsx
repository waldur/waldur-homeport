import { ClockCountdownIcon, WrenchIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { PublicMaintenanceAnnouncement } from 'waldur-js-client';

import { Badge, HelpIcon, Tooltip } from 'waldur-ui';

import { formatMediumDateTime, formatRelative } from '@/core/dateUtils';
import { translate } from '@/i18n';

import {
  getMaintenancesForOffering,
  isUnderway,
  usePublicMaintenances,
} from './usePublicMaintenances';

interface Props {
  offeringUuid?: string;
  /**
   * An icon with the label in its tooltip, for table cells: the full badge
   * widened the Name column and wrapped the row onto extra lines.
   */
  compact?: boolean;
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

const MaintenanceBadge: FC<{
  maintenance: PublicMaintenanceAnnouncement;
  compact?: boolean;
}> = ({ maintenance, compact }) => {
  const isInProgress = isUnderway(maintenance);
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

  if (compact) {
    return (
      <HelpIcon
        icon={isInProgress ? WrenchIcon : ClockCountdownIcon}
        tone={isInProgress ? 'warning' : 'muted'}
        className={isInProgress ? undefined : 'text-brand'}
        aria-label={label}
        label={[label, buildTooltip(maintenance)].filter(Boolean).join(' · ')}
      />
    );
  }

  return (
    <Tooltip label={buildTooltip(maintenance)}>
      <Badge
        variant={variant}
        size="sm"
        leftIcon={icon}
        shape="pill"
        tone="outline"
      >
        {label}
      </Badge>
    </Tooltip>
  );
};

export const PublicMaintenanceBadge: FC<Props> = ({
  offeringUuid,
  compact,
}) => {
  const { data } = usePublicMaintenances();
  const matches = getMaintenancesForOffering(data, offeringUuid);
  if (matches.length === 0) return null;
  const badges = matches.map((maintenance) => (
    <MaintenanceBadge
      key={maintenance.uuid}
      maintenance={maintenance}
      compact={compact}
    />
  ));
  return compact ? (
    <>{badges}</>
  ) : (
    <div className="flex flex-wrap gap-1">{badges}</div>
  );
};
