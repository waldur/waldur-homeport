import { FC } from 'react';

import { AccordionCard } from 'waldur-ui';

import { FieldError } from '@/form';
import { translate } from '@/i18n';

import { K8sEgressPolicy, K8sEgressRule } from './k8sEgressRules';
import {
  K8sEgressRulesEditor,
  K8sEgressRulesList,
} from './K8sEgressRulesTable';

/**
 * The customer's outbound destinations, with the offering's baseline ones
 * listed above them read-only. Used in the order form and to change the
 * rules of an existing cluster.
 */
export const K8sEgressRulesSection: FC<{
  policy: K8sEgressPolicy;
  rules: K8sEgressRule[];
  onChange: (rules: K8sEgressRule[]) => void;
  title?: string;
  error?: string[] | string;
  className?: string;
}> = ({ policy, rules, onChange, title, error, className }) => {
  const baseline = policy.egress_baseline_rules || [];
  return (
    <AccordionCard
      title={title || translate('Egress rules')}
      subtitle={
        policy.egress_domain_rules_allowed
          ? translate(
              'Outbound destinations the cluster may reach: networks or domain names. Leave protocol and ports empty to allow any traffic to a destination.',
            )
          : translate(
              'Outbound networks the cluster may reach. Leave protocol and ports empty to allow any traffic to a destination.',
            )
      }
      secondary
      defaultOpen
      className={className}
    >
      <p className="text-quaternary mb-3" data-testid="k8s-egress-semantics">
        {rules.length
          ? translate(
              'Outbound traffic is denied except to the destinations below and the provider’s baseline destinations.',
            )
          : translate(
              'Outbound traffic is unrestricted. Adding a rule denies outbound traffic to anything not listed here or among the provider’s baseline destinations.',
            )}
      </p>
      {error && (
        <div className="mb-3">
          <FieldError error={error} />
        </div>
      )}
      {baseline.length > 0 && (
        <div className="mb-4" data-testid="k8s-egress-baseline">
          <h6 className="text-secondary mb-2">
            {translate('Always allowed by the provider')}
          </h6>
          <K8sEgressRulesList rules={baseline} />
        </div>
      )}
      <K8sEgressRulesEditor
        rules={rules}
        onChange={onChange}
        allowDomains={Boolean(policy.egress_domain_rules_allowed)}
        emptyMessage={translate(
          'Add the networks or domains the cluster needs to reach.',
        )}
      />
    </AccordionCard>
  );
};
