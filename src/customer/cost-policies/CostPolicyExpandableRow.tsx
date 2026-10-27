import { FC } from 'react';

import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import { CostPolicyAffectedResources } from './CostPolicyAffectedResources';
import { CostPolicyCost } from './CostPolicyCost';
import { getPolicyPeriodText, getResetScenarios } from './costPolicyDetails';
import { CostPolicyResetTable } from './CostPolicyResetTable';
import { CostPolicyType } from './types';
import { useCostPolicyDetails } from './useCostPolicyDetails';

const Block: FC<{ title: string; children }> = ({ title, children }) => (
  <div className="mb-5">
    <h4 className="text-sm font-semibold mb-2">{title}</h4>
    {children}
  </div>
);

/** A policy at a glance, under its row: what it counts, the cost against the
 * limit, what would reset its actions and which resources they changed. The
 * details dialog adds the reasons in full and the earlier invoices. */
export const CostPolicyExpandableRow: FC<{
  row;
  type?: CostPolicyType;
}> = ({ row, type = 'project' }) => {
  const { policy, earlierInvoices, figures } = useCostPolicyDetails(row, type);
  const triggered = Boolean(policy.trigger_status?.triggered);
  return (
    <ExpandableContainer>
      <p className="mb-4 text-secondary">
        <span className="font-medium text-primary">
          {translate('Counted period:')}
        </span>{' '}
        {getPolicyPeriodText(policy, earlierInvoices?.months?.[0]?.period)}
      </p>

      <Block title={translate('Cost against the limit')}>
        <CostPolicyCost
          policy={policy}
          figures={figures}
          months={earlierInvoices?.months}
        />
        <p className="mt-2 mb-0 text-quaternary text-sm">
          {translate(
            'Cost in the period {before}, less credit already used {drawn} and credit still to be used this month {pending}.',
            {
              before: defaultCurrency(figures.beforeCredit),
              drawn: defaultCurrency(figures.drawn),
              pending: defaultCurrency(figures.pending),
            },
          )}
        </p>
      </Block>

      {triggered ? (
        <Block title={translate('When the actions are reset')}>
          <CostPolicyResetTable
            policyUuid={policy.uuid}
            scenarios={getResetScenarios(policy)}
          />
        </Block>
      ) : null}

      {policy.has_fired ? (
        <Block
          title={translate('Affected resources ({count})', {
            count: policy.affected_resources_count ?? 0,
          })}
        >
          <CostPolicyAffectedResources policy={policy} type={type} />
        </Block>
      ) : null}
    </ExpandableContainer>
  );
};
