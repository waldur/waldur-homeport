import { FC, useMemo } from 'react';
import { Offering } from 'waldur-js-client';

import { defaultCurrency } from '@/core/formatCurrency';
import { Link } from '@/core/Link';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';

import { getOfferingEntryPrice, getOrderablePlans } from './planPricing';

interface OfferingPriceSummaryProps {
  offering: Offering;
  /** All of the viewer's organizations hide billing information. */
  concealPricing?: boolean;
}

/**
 * The entry price, shown next to the primary call to action so the purchase
 * decision does not require opening the pricing tab first.
 */
export const OfferingPriceSummary: FC<OfferingPriceSummaryProps> = ({
  offering,
  concealPricing,
}) => {
  const pricing = useMemo(
    () => (offering?.plans?.length ? getOfferingEntryPrice(offering) : null),
    [offering],
  );

  if (
    !pricing ||
    concealPricing ||
    offering.plugin_options?.conceal_billing_data ||
    isFeatureVisible(MarketplaceFeatures.catalogue_only) ||
    isFeatureVisible(MarketplaceFeatures.conceal_prices) ||
    isFeatureVisible(
      MarketplaceFeatures.conceal_offering_pricing_tab_in_public_view,
    )
  ) {
    return null;
  }

  // A plan with no fixed part costs nothing until it is used; quoting zero
  // would read as free rather than as metered.
  const meteredOnly = pricing.monthlyBase === 0 && pricing.hasVariableCost;
  // A plan whose only charge is taken once would otherwise advertise
  // "€0.00 / month" and hide the figure that actually applies.
  const oneTimeOnly =
    pricing.monthlyBase === 0 &&
    !pricing.hasVariableCost &&
    pricing.oneTime > 0;
  const isFloor =
    getOrderablePlans(offering).length > 1 || pricing.hasVariableCost;

  return (
    <div className="d-flex flex-column justify-content-center align-items-sm-end order-1 order-sm-0">
      <div className="lh-1">
        {meteredOnly ? (
          <span className="fs-4 fw-bold text-gray-900">
            {translate('Usage-based')}
          </span>
        ) : oneTimeOnly ? (
          <>
            <span className="fs-2 fw-bold text-gray-900">
              {defaultCurrency(pricing.oneTime)}
            </span>
            <span className="fs-7 text-muted"> {translate('once')}</span>
          </>
        ) : (
          <>
            {isFloor && (
              <span className="fs-8 text-muted me-1">{translate('From')}</span>
            )}
            <span className="fs-2 fw-bold text-gray-900">
              {defaultCurrency(pricing.monthlyBase)}
            </span>
            <span className="fs-7 text-muted">
              {' / '}
              {pricing.periodLabel}
            </span>
          </>
        )}
      </div>
      <Link
        state="public-offering.marketplace-public-offering"
        params={{ uuid: offering.uuid, tab: 'pricing' }}
        label={translate('See all plans')}
        className="fs-8"
      />
    </div>
  );
};
