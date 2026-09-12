import { FC, useMemo } from 'react';
import { PublicOfferingDetails } from 'waldur-js-client';

import { Panel } from '@/core/Panel';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';

import { ExportFullPriceList } from './ExportFullPriceList';
import { PlanComparison } from './PlanComparison';
import { hasVariablePricing } from './planPricing';

import './PublicOfferingPricing.scss';

interface PublicOfferingPricingProps {
  offering: PublicOfferingDetails;
}

export const PublicOfferingPricing: FC<PublicOfferingPricingProps> = ({
  offering,
}) => {
  // Explains the headline figure, so it belongs beside the title rather than
  // as a footnote under the table.
  const subtitle = useMemo(
    () =>
      !isFeatureVisible(MarketplaceFeatures.conceal_prices) &&
      hasVariablePricing(offering) ? (
        // Same treatment as a report description (see ReportingTitle):
        // Panel's own subtitle renders bold at fs-6.
        <span className="fw-normal">
          {translate(
            'The starting price covers what the plan fixes. Components you size yourself and metered usage are charged on top, at the rates above.',
          )}
        </span>
      ) : undefined,
    [offering],
  );

  return (
    <Panel
      title={translate('Plans')}
      subtitle={subtitle}
      actions={<ExportFullPriceList offering={offering} />}
      cardBordered
      id="pricing"
      className="public-offering-pricing"
      // The table draws its own header row directly under the panel title.
      bodyClassName="pt-0"
    >
      <PlanComparison offering={offering} />
    </Panel>
  );
};
