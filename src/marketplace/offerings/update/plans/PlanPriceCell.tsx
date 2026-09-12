import { FC, useMemo } from 'react';
import {
  ProviderOfferingDetails,
  ProviderPlanDetails as Plan,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';
import { getEffectiveComponents } from '@/marketplace/details/plan/effectiveComponents';
import { getPlanPricing } from '@/marketplace/offerings/details/planPricing';
import { DASH_ESCAPE_CODE } from '@/table/constants';

import { getPlanPriceStatus } from './planPrices';

/** The same phrasing ComponentCost uses, so one price reads one way. */
const formatUnitPrice = (unit: string | undefined, price: number) =>
  unit
    ? translate('{price} per {unit}', { price: defaultCurrency(price), unit })
    : String(defaultCurrency(price));

interface PlanPriceCellProps {
  plan: Plan;
  offering: Pick<ProviderOfferingDetails, 'type' | 'components' | 'billable'>;
}

/**
 * What the plan charges, without expanding its row: one figure, since the
 * per-component breakdown is one click away. The figure is `getPlanPricing`'s,
 * so the provider reads the same number the catalogue quotes the customer, and
 * a floor is labelled as one.
 */
export const PlanPriceCell: FC<PlanPriceCellProps> = ({ plan, offering }) => {
  const components = useMemo(
    () => getEffectiveComponents(offering, plan as any),
    [offering, plan],
  );
  const status = useMemo(
    () => getPlanPriceStatus(plan, components),
    [plan, components],
  );
  const pricing = useMemo(
    () => getPlanPricing(offering, plan as any),
    [offering, plan],
  );

  if (!components.length) {
    return <>{DASH_ESCAPE_CODE}</>;
  }

  if (status.isUnpriced) {
    // The figure, like every other money column, labelled as what it is.
    // Neutral rather than a warning: stored prices cannot tell a plan priced
    // at 0 on purpose from one nobody priced -- both are zeros -- so the label
    // states the fact and leaves the judgement to the provider. Add plan is
    // where an unpriced plan is stopped.
    return (
      <span>
        {defaultCurrency(0)}
        {/* `default`, the gray BillingTypeBadge uses: this theme tints
            `secondary` green, which would read as a status. */}
        <Badge variant="default" size="sm" pill outline className="ms-2">
          {translate('Free')}
        </Badge>
      </span>
    );
  }

  // A recurring charge leads; failing that a one-off; failing both, the plan
  // is metered and one component's unit price is all there is to quote.
  const headline = pricing.monthlyBase
    ? {
        text: translate('{price} / {period}', {
          price: defaultCurrency(pricing.monthlyBase),
          period: pricing.periodLabel,
        }),
        quotesOneComponent: false,
      }
    : pricing.oneTime && !pricing.hasVariableCost
      ? {
          text: translate('{price} once', {
            price: defaultCurrency(pricing.oneTime),
          }),
          quotesOneComponent: false,
        }
      : {
          // Named: the unit alone does not say which component it is, since
          // RAM and storage are both GB-hours.
          text: translate('{name} {price}', {
            name: status.priced[0].component.name,
            price: formatUnitPrice(
              status.priced[0].component.measured_unit,
              status.priced[0].price,
            ),
          }),
          quotesOneComponent: true,
        };

  return (
    <span>
      {pricing.hasVariableCost && !headline.quotesOneComponent
        ? translate('From {price}', { price: headline.text })
        : headline.text}
      {headline.quotesOneComponent && status.priced.length > 1 && (
        <span className="text-muted ms-1">
          {translate('+{count} more', { count: status.priced.length - 1 })}
        </span>
      )}
    </span>
  );
};
