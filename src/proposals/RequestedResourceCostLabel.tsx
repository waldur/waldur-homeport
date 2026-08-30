import { FC } from 'react';

import { defaultCurrency } from '@/core/formatCurrency';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { DASH_ESCAPE_CODE } from '@/table/constants';

import { RequestedResourceCost } from './requestedResourceCost';

interface RequestedResourceCostLabelProps {
  cost: RequestedResourceCost;
  /** Renders the one-time part on its own line rather than inline. */
  stacked?: boolean;
  /** Renders one half only, for tables giving each charge its own column. */
  part?: 'monthly' | 'oneTime';
}

/**
 * A requested resource's expected cost.
 *
 * Always labelled as an estimate: the figure is computed in the browser from
 * the plan's price list, while the amount actually billed is recomputed by the
 * backend when the proposal is allocated (Plan.get_estimate via init_cost).
 * The two can differ on prepaid durations and order-time init prices.
 *
 * There is no per-customer concealment to apply here — a proposal has no
 * customer or project until it is approved and allocate_proposal creates one —
 * so only the global conceal_prices feature is honoured.
 */
export const RequestedResourceCostLabel: FC<
  RequestedResourceCostLabelProps
> = ({ cost, stacked, part }) => {
  if (isFeatureVisible(MarketplaceFeatures.conceal_prices)) {
    return <>{DASH_ESCAPE_CODE}</>;
  }
  if (!cost.known) {
    return <>{DASH_ESCAPE_CODE}</>;
  }
  if (part) {
    const amount = part === 'monthly' ? cost.monthly : cost.oneTime;
    if (!amount) {
      return <>{DASH_ESCAPE_CODE}</>;
    }
    return (
      <span>
        {defaultCurrency(amount)}
        {part === 'monthly' && (
          <span className="text-muted">{translate(' /mo')}</span>
        )}
      </span>
    );
  }
  const monthly = (
    <span>
      {defaultCurrency(cost.monthly)}
      <span className="text-muted">{translate(' /mo')}</span>
    </span>
  );
  if (!cost.oneTime) {
    return monthly;
  }
  // Charged once, but for a period the applicant chose — so name it.
  const oneTimeSuffix = cost.prepaidMonths
    ? cost.prepaidMonths === 1
      ? translate(' for 1 month')
      : translate(' for {count} months', { count: cost.prepaidMonths })
    : translate(' one-time');
  // A grant awarded as a lump allocation has no recurring part; printing
  // "€0.00 /mo" next to the real figure just invites a double-take.
  if (!cost.monthly) {
    return (
      <span>
        {defaultCurrency(cost.oneTime)}
        <span className="text-muted">{oneTimeSuffix}</span>
      </span>
    );
  }
  const oneTime = (
    <span className="text-muted fs-7">
      {defaultCurrency(cost.oneTime)}
      {oneTimeSuffix}
    </span>
  );
  return stacked ? (
    <span className="d-flex flex-column">
      {monthly}
      {oneTime}
    </span>
  ) : (
    <span>
      {monthly} {oneTime}
    </span>
  );
};
