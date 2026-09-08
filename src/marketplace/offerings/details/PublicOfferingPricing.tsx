import { FC } from 'react';
import { PublicOfferingDetails } from 'waldur-js-client';

import { Panel } from '@/core/Panel';
import { translate } from '@/i18n';

import { ExportFullPriceList } from './ExportFullPriceList';
import { PlanComparison } from './PlanComparison';

import './PublicOfferingPricing.scss';

interface PublicOfferingPricingProps {
  offering: PublicOfferingDetails;
}

export const PublicOfferingPricing: FC<PublicOfferingPricingProps> = ({
  offering,
}) => (
  <Panel
    title={translate('Plans')}
    actions={<ExportFullPriceList offering={offering} />}
    cardBordered
    id="pricing"
    className="public-offering-pricing"
  >
    <PlanComparison offering={offering} />
  </Panel>
);
