import {
  ArrowsInSimpleIcon,
  CalendarXIcon,
  ClockCountdownIcon,
  PauseCircleIcon,
  WarningCircleIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import { Resource } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { formatDate, formatMediumDateTime } from '@/core/dateUtils';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';

export interface PolicyAttribution {
  policy_class?: string;
  policy_uuid?: string;
  action?: string;
  scope_name?: string;
  timestamp?: string;
  limit_cost?: string;
}

export const getAttribution = (
  resource: Resource,
  field: string,
): PolicyAttribution | null => {
  const attrs = resource.attributes as Record<string, unknown> | undefined;
  if (!attrs) return null;
  const pa = attrs['_policy_attribution'] as
    Record<string, PolicyAttribution> | undefined;
  return pa?.[field] || null;
};

export const POLICY_LABELS: Record<string, string> = {
  ProjectEstimatedCostPolicy: 'Project cost policy',
  CustomerEstimatedCostPolicy: 'Organization cost policy',
  OfferingEstimatedCostPolicy: 'Offering cost policy',
  OfferingUsagePolicy: 'Offering usage policy',
  SlurmPeriodicUsagePolicy: 'SLURM usage policy',
};

const formatAttribution = (attr: PolicyAttribution): string => {
  const policyType = attr.policy_class
    ? POLICY_LABELS[attr.policy_class] || attr.policy_class
    : translate('policy');
  const parts = [policyType];
  if (attr.scope_name) {
    parts.push(`(${attr.scope_name})`);
  }
  if (attr.limit_cost) {
    parts.push(`— ${translate('limit')}: ${attr.limit_cost}`);
  }
  if (attr.timestamp) {
    parts.push(translate('on'), formatMediumDateTime(attr.timestamp));
  }
  return parts.join(' ');
};

const FlagBadge = ({
  resource,
  field,
  variant,
  icon,
  label,
  tipId,
}: {
  resource: Resource;
  field: string;
  variant: 'danger';
  icon: React.ReactNode;
  label: string;
  tipId: string;
}) => {
  const attribution = getAttribution(resource, field);

  const badge = (
    <Badge variant={variant} size="sm" leftIcon={icon} pill outline>
      {label}
    </Badge>
  );

  const tooltipLabel = attribution
    ? formatAttribution(attribution)
    : translate('Manually set');

  return (
    <Tip id={tipId} label={tooltipLabel}>
      {badge}
    </Tip>
  );
};

const LifecycleBadge = ({
  variant,
  icon,
  label,
  tooltip,
  tipId,
}: {
  variant: 'warning' | 'danger';
  icon: React.ReactNode;
  label: string;
  tooltip: string;
  tipId: string;
}) => (
  <Tip id={tipId} label={tooltip}>
    <Badge variant={variant} size="sm" leftIcon={icon} pill outline>
      {label}
    </Badge>
  </Tip>
);

const TERMINAL_STATES = new Set(['Terminated', 'Terminating']);

export const ResourceFlags = ({ resource }: { resource: Resource }) => {
  const pluginOptions = resource.offering_plugin_options as any;
  const supportsPausing = pluginOptions?.supports_pausing === true;
  const supportsDownscaling = pluginOptions?.supports_downscaling === true;

  const today = new Date();
  const projectEffectiveEnd = resource.project_effective_end_date
    ? new Date(resource.project_effective_end_date)
    : null;
  const resourceEnd = resource.end_date ? new Date(resource.end_date) : null;
  const isTerminal = TERMINAL_STATES.has(resource.state as string);

  const showInGrace = resource.project_is_in_grace_period === true;
  const showExpired =
    !showInGrace && projectEffectiveEnd && projectEffectiveEnd < today;
  const showConflict =
    resourceEnd && projectEffectiveEnd && resourceEnd > projectEffectiveEnd;
  const showOverdue = resourceEnd && resourceEnd < today && !isTerminal;

  return (
    <>
      {resource.restrict_member_access && (
        <FlagBadge
          resource={resource}
          field="restrict_member_access"
          variant="danger"
          icon={<XCircleIcon weight="bold" />}
          label={translate('Access restricted')}
          tipId="flag-restrict-member"
        />
      )}
      {supportsPausing && resource.paused && (
        <FlagBadge
          resource={resource}
          field="paused"
          variant="danger"
          icon={<PauseCircleIcon weight="bold" />}
          label={translate('Paused')}
          tipId="flag-paused"
        />
      )}
      {supportsDownscaling && resource.downscaled && (
        <FlagBadge
          resource={resource}
          field="downscaled"
          variant="danger"
          icon={<ArrowsInSimpleIcon weight="bold" />}
          label={translate('Downscaled')}
          tipId="flag-downscaled"
        />
      )}
      {showInGrace && (
        <LifecycleBadge
          variant="warning"
          icon={<ClockCountdownIcon weight="bold" />}
          label={translate('In grace')}
          tooltip={translate(
            'Project is in its grace period. Resource will be terminated on {date}.',
            {
              date: resource.project_effective_end_date
                ? formatDate(resource.project_effective_end_date)
                : '',
            },
          )}
          tipId="flag-in-grace"
        />
      )}
      {showExpired && (
        <LifecycleBadge
          variant="danger"
          icon={<WarningCircleIcon weight="bold" />}
          label={translate('Expired')}
          tooltip={translate(
            'Project expired on {date}. Resource is scheduled for termination.',
            { date: formatDate(resource.project_effective_end_date) },
          )}
          tipId="flag-expired"
        />
      )}
      {showConflict && (
        <LifecycleBadge
          variant="warning"
          icon={<CalendarXIcon weight="bold" />}
          label={translate('Ends with project')}
          tooltip={translate(
            'Resource end date ({resourceEnd}) extends past project effective end ({projectEnd}). Will be terminated with the project.',
            {
              resourceEnd: formatDate(resource.end_date),
              projectEnd: formatDate(resource.project_effective_end_date),
            },
          )}
          tipId="flag-ends-with-project"
        />
      )}
      {showOverdue && (
        <LifecycleBadge
          variant="danger"
          icon={<WarningCircleIcon weight="bold" />}
          label={translate('Overdue')}
          tooltip={translate(
            'Resource end date ({date}) has passed but it is still active. Awaiting termination.',
            { date: formatDate(resource.end_date) },
          )}
          tipId="flag-overdue"
        />
      )}
    </>
  );
};
