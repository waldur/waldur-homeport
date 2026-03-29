import {
  ArrowsInSimpleIcon,
  Icon,
  PauseCircleIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import { FC } from 'react';
import { Resource } from 'waldur-js-client';

import { formatMediumDateTime } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { AnnouncementBar } from '@waldur/navigation/header/announcements/AnnouncementBar';

import {
  getAttribution,
  PolicyAttribution,
  POLICY_LABELS,
} from './ResourceFlags';

const formatBannerDescription = (attr: PolicyAttribution): string => {
  const policyType = attr.policy_class
    ? POLICY_LABELS[attr.policy_class] || attr.policy_class
    : translate('A cost policy');

  const parts = [policyType];
  if (attr.scope_name) {
    parts.push(`(${attr.scope_name})`);
  }
  if (attr.limit_cost) {
    parts.push(
      `— ${translate('cost limit')}: ${defaultCurrency(Number(attr.limit_cost))}`,
    );
  }
  if (attr.timestamp) {
    parts.push(
      `— ${translate('triggered on')} ${formatMediumDateTime(attr.timestamp)}`,
    );
  }
  return parts.join(' ');
};

interface FlagConfig {
  field: 'paused' | 'downscaled' | 'restrict_member_access';
  label: string;
  recoveryMessage: string;
  icon: Icon;
  supportCheck?: string;
}

const FLAGS: FlagConfig[] = [
  {
    field: 'paused',
    label: translate('Resource paused by policy'),
    recoveryMessage: translate(
      'The resource will be unpaused automatically when costs drop below the threshold.',
    ),
    icon: PauseCircleIcon,
    supportCheck: 'supports_pausing',
  },
  {
    field: 'downscaled',
    label: translate('Resource downscaled by policy'),
    recoveryMessage: translate(
      'The resource will be restored automatically when costs drop below the threshold.',
    ),
    icon: ArrowsInSimpleIcon,
    supportCheck: 'supports_downscaling',
  },
  {
    field: 'restrict_member_access',
    label: translate('Member access restricted by policy'),
    recoveryMessage: translate(
      'Access will be restored automatically when costs drop below the threshold.',
    ),
    icon: XCircleIcon,
    supportCheck: 'service_provider_can_create_offering_user',
  },
];

export const PolicyAttributionBanner: FC<{ resource: Resource }> = ({
  resource,
}) => {
  const pluginOptions = resource.offering_plugin_options as any;

  return (
    <>
      {FLAGS.map(
        ({ field, label, recoveryMessage, icon: Icon, supportCheck }) => {
          if (!resource[field]) return null;
          if (supportCheck && !pluginOptions?.[supportCheck]) return null;

          const attribution = getAttribution(resource, field);

          if (attribution) {
            const policyDescription = formatBannerDescription(attribution);
            return (
              <AnnouncementBar
                key={field}
                icon={Icon}
                variant="danger"
                label={label}
                description={`${policyDescription}. ${recoveryMessage}`}
                colored
              />
            );
          }

          return (
            <AnnouncementBar
              key={field}
              icon={Icon}
              variant="warning"
              label={translate('Resource {field} manually', { field })}
              description={translate(
                'This was set manually by an administrator.',
              )}
              colored
            />
          );
        },
      )}
    </>
  );
};
