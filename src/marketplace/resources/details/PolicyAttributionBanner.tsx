import {
  ArrowsInSimpleIcon,
  Icon,
  PauseCircleIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import {
  marketplaceCustomerEstimatedCostPoliciesRetrieve,
  marketplaceProjectEstimatedCostPoliciesRetrieve,
  Resource,
} from 'waldur-js-client';

import { formatMediumDateTime } from '@/core/dateUtils';
import { defaultCurrency } from '@/core/formatCurrency';
import { getCostPolicySummary } from '@/customer/cost-policies/costPolicyDetails';
import {
  useCanFixCostPolicy,
  useCostPolicyDialogs,
} from '@/customer/cost-policies/CostPolicyLinks';
import { translate } from '@/i18n';
import { isAllTimeLimitReached } from '@/marketplace/common/spendingLimits';
import { AnnouncementBar } from '@/navigation/header/announcements/AnnouncementBar';

import {
  getAttribution,
  PolicyAttribution,
  POLICY_LABELS,
} from './ResourceFlags';
import {
  getRestrictionHeldBy,
  getRestrictionResumes,
} from './spendingLimitRestriction';

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
  // Shown when the flag was set by the usage-limit mechanism
  // (resource.usage_limit_restriction), as opposed to a cost policy or a
  // manual action.
  usageLimitLabel?: string;
  usageLimitRecovery?: string;
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
    usageLimitLabel: translate('Resource paused: usage limit reached'),
    usageLimitRecovery: translate(
      'Reported usage reached the configured limit. It will be unpaused automatically when usage drops below the limit.',
    ),
  },
  {
    field: 'downscaled',
    label: translate('Resource downscaled by policy'),
    recoveryMessage: translate(
      'The resource will be restored automatically when costs drop below the threshold.',
    ),
    icon: ArrowsInSimpleIcon,
    supportCheck: 'supports_downscaling',
    usageLimitLabel: translate('Resource downscaled: usage limit reached'),
    usageLimitRecovery: translate(
      'Reported usage reached the configured limit. It will be restored automatically when usage drops below the limit.',
    ),
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

const COST_POLICY_RETRIEVE = {
  ProjectEstimatedCostPolicy: marketplaceProjectEstimatedCostPoliciesRetrieve,
  CustomerEstimatedCostPolicy: marketplaceCustomerEstimatedCostPoliciesRetrieve,
};

/** The cost policy that set the flag, for a one-line reason on the bar and
 * the details dialog behind it.
 *
 * Null while it loads, and when the user may not read it (an organization
 * policy is not visible to project roles): the bar then keeps its generic
 * recovery message and offers no details.
 */
const useAttributedCostPolicy = (attribution: PolicyAttribution) => {
  const retrieve = COST_POLICY_RETRIEVE[attribution.policy_class];
  const { data } = useQuery({
    queryKey: [
      'PolicyAttributionCostPolicy',
      attribution.policy_class,
      attribution.policy_uuid,
    ],
    queryFn: () =>
      retrieve({ path: { uuid: attribution.policy_uuid } }).then(
        (response) => response.data,
      ),
    enabled: Boolean(retrieve && attribution.policy_uuid),
    retry: false,
    refetchOnWindowFocus: false,
  });
  return data ?? null;
};

const CostPolicyFlagBar: FC<{
  attribution: PolicyAttribution;
  customerUuid: string;
  icon: Icon;
  label: string;
  recoveryMessage: string;
}> = ({ attribution, customerUuid, icon, label, recoveryMessage }) => {
  const policy = useAttributedCostPolicy(attribution);
  const type =
    attribution.policy_class === 'CustomerEstimatedCostPolicy'
      ? 'organization'
      : 'project';
  const canFix = useCanFixCostPolicy(policy, type, customerUuid);
  const { openDetails, openFix } = useCostPolicyDialogs(
    policy,
    type,
    customerUuid,
  );
  if (!policy) {
    return (
      <AnnouncementBar
        icon={icon}
        variant="danger"
        label={label}
        description={`${formatBannerDescription(attribution)}. ${recoveryMessage}`}
        colored
      />
    );
  }
  return (
    <AnnouncementBar
      icon={icon}
      variant="danger"
      label={label}
      description={getCostPolicySummary(policy)}
      secondaryActionLabel={translate('Details')}
      onSecondaryAction={openDetails}
      actionLabel={canFix ? translate('Fix…') : undefined}
      onAction={canFix ? openFix : undefined}
      colored
    />
  );
};

// What lifts a usage-limit restriction, in the Usage tab's words, when the
// spending limits say it: a reached all-time limit holds until it is raised or
// cleared, and a reached calendar limit lifts when it resets. Otherwise (a
// limit-billed component over its limit, or no spending limit status) usage
// has to drop below the limit, as the flag's own message says.
const getUsageLimitRecovery = (resource: Resource, fallback: string) => {
  if (
    !resource.usage_limit_resumes_at &&
    !isAllTimeLimitReached(resource.spending_limit_status)
  ) {
    return fallback;
  }
  const heldBy =
    getRestrictionHeldBy(resource) ??
    translate('Reported usage reached the configured limit.');
  return `${heldBy} ${getRestrictionResumes(resource)}`;
};

export const PolicyAttributionBanner: FC<{ resource: Resource }> = ({
  resource,
}) => {
  const pluginOptions = resource.offering_plugin_options as any;
  const usageLimitRestriction = resource.usage_limit_restriction;

  return (
    <>
      {FLAGS.map(
        ({
          field,
          label,
          recoveryMessage,
          icon: Icon,
          supportCheck,
          usageLimitLabel,
          usageLimitRecovery,
        }) => {
          if (!resource[field]) return null;
          if (supportCheck && !pluginOptions?.[supportCheck]) return null;

          const attribution = getAttribution(resource, field);

          if (attribution) {
            return (
              <CostPolicyFlagBar
                key={field}
                attribution={attribution}
                customerUuid={resource.customer_uuid}
                icon={Icon}
                label={label}
                recoveryMessage={recoveryMessage}
              />
            );
          }

          // Set by the usage-limit mechanism (reported usage reached the
          // component/resource limit), not manually.
          if (
            usageLimitRestriction === field &&
            usageLimitLabel &&
            usageLimitRecovery
          ) {
            return (
              <AnnouncementBar
                key={field}
                icon={Icon}
                variant="danger"
                label={usageLimitLabel}
                description={getUsageLimitRecovery(
                  resource,
                  usageLimitRecovery,
                )}
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
