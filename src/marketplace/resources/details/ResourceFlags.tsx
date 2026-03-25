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

const formatAttribution = (attr: PolicyAttribution): string => {
  const policyLabel =
    attr.scope_name || attr.policy_class || translate('policy');
  const parts = [translate('Set by'), policyLabel];
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

  if (attribution) {
    return (
      <Tip id={tipId} label={formatAttribution(attribution)}>
        {badge}
      </Tip>
    );
  }

  return badge;
};

export const ResourceFlags = ({ resource }: { resource: Resource }) => {
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
      {resource.paused && (
        <FlagBadge
          resource={resource}
          field="paused"
          variant="danger"
          icon={<PauseCircleIcon weight="bold" />}
          label={translate('Paused')}
          tipId="flag-paused"
        />
      )}
      {resource.downscaled && (
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
