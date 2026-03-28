import {
  ArrowsInSimpleIcon,
  PauseCircleIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import { Resource } from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { formatMediumDateTime } from '@waldur/core/dateUtils';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

interface PolicyAttribution {
  policy_class?: string;
  policy_uuid?: string;
  action?: string;
  scope_name?: string;
  timestamp?: string;
  limit_cost?: string;
}

const getAttribution = (
  resource: Resource,
  field: string,
): PolicyAttribution | null => {
  const attrs = resource.attributes as Record<string, unknown> | undefined;
  if (!attrs) return null;
  const pa = attrs['_policy_attribution'] as
    | Record<string, PolicyAttribution>
    | undefined;
  return pa?.[field] || null;
};

const POLICY_LABELS: Record<string, string> = {
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

export const ResourceFlags = ({ resource }: { resource: Resource }) => {
  const pluginOptions = resource.offering_plugin_options as any;
  const supportsPausing = pluginOptions?.supports_pausing === true;
  const supportsDownscaling = pluginOptions?.supports_downscaling === true;

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
    </>
  );
};
