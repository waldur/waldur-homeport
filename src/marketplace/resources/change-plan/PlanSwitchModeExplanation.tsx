import { FC } from 'react';

import { AlertItem } from '@/core/AlertItem';
import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';
import {
  getPlanBillingModeLabel,
  PlanBilling,
} from '@/marketplace/details/plan/billingMode';

export interface BilledLimit {
  name: string;
  limit: number;
  measured_unit: string;
  price: number;
  subTotal: number;
}

interface PlanSwitchModeExplanationProps {
  currentMode: PlanBilling | null;
  targetMode: PlanBilling | null;
  currentPlanName: string;
  targetPlanName: string;
  /** Limits the target plan will bill, shown for a switch onto a limit plan. */
  billedLimits?: BilledLimit[];
  billingPeriod?: string;
  concealPrices?: boolean;
}

/**
 * What changes for the customer when the billing of the plan changes.
 * Rendered only when the two plans bill differently.
 */
export const PlanSwitchModeExplanation: FC<PlanSwitchModeExplanationProps> = ({
  currentMode,
  targetMode,
  currentPlanName,
  targetPlanName,
  billedLimits = [],
  billingPeriod,
  concealPrices,
}) => {
  if (!currentMode || !targetMode || currentMode === targetMode) {
    return null;
  }
  const limitToUsage = currentMode === 'limit' && targetMode === 'usage';
  const usageToLimit = currentMode === 'usage' && targetMode === 'limit';
  const total = billedLimits.reduce((sum, row) => sum + row.subTotal, 0);
  const summary = limitToUsage
    ? translate(
        'Switching from limit-based to usage-based billing. The fee of "{current}" is charged for its current billing period: a monthly plan keeps this month\'s fee, a daily plan is charged for the days used. From then on you are billed for actual consumption at the rates of "{target}"; nothing is charged in advance. Your quotas stay unchanged and now cap usage instead of being billed.',
        { current: currentPlanName, target: targetPlanName },
      )
    : usageToLimit
      ? translate(
          'Switching from usage-based to limit-based billing. Usage accrued this month before the switch is invoiced at the rates of "{current}". From the switch the fee of "{target}" applies for its billing period (the whole month for a monthly plan, per day for a daily plan), based on your current quotas:',
          { current: currentPlanName, target: targetPlanName },
        )
      : translate(
          'The billing model changes from {current} to {target} on the day of the switch.',
          {
            current: getPlanBillingModeLabel(currentMode),
            target: getPlanBillingModeLabel(targetMode),
          },
        );
  return (
    <AlertItem
      className="mt-4"
      variant="info"
      title={translate('Billing changes with this plan')}
      body={
        <>
          <p className="mb-2">{summary}</p>
          {usageToLimit && billedLimits.length > 0 && (
            <ul className="mb-2">
              {billedLimits.map((row) => (
                <li key={row.name}>
                  {row.name}: {row.limit} {row.measured_unit}
                  {!concealPrices &&
                    ` × ${defaultCurrency(row.price)} = ${defaultCurrency(row.subTotal)}`}
                </li>
              ))}
              {!concealPrices && (
                <li className="fw-bold">
                  {translate('Fee: {amount}', {
                    amount: defaultCurrency(total),
                  })}
                  {billingPeriod ? ` / ${billingPeriod}` : ''}
                </li>
              )}
            </ul>
          )}
          {billingPeriod && (
            <p className="mb-0">
              {translate('Both plans use the same billing period ({period}).', {
                period: billingPeriod,
              })}
            </p>
          )}
        </>
      }
    />
  );
};
