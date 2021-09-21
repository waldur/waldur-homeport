import { FunctionComponent } from 'react';

import { PublicOfferingPricingPlanItem } from '@waldur/marketplace/offerings/details/PublicOfferingPricingPlanItem';
import { Offering, Plan } from '@waldur/marketplace/types';
import './PublicOfferingPricingPlans.scss';

interface PublicOfferingPricingPlansProps {
  offering: Offering;
}

export const PublicOfferingPricingPlans: FunctionComponent<PublicOfferingPricingPlansProps> = ({
  offering,
}) => (
  <div className="pricingPlans">
    {offering.plans.map((plan: Plan, i: number) => (
      <PublicOfferingPricingPlanItem key={i} offering={offering} plan={plan} />
    ))}
  </div>
);
