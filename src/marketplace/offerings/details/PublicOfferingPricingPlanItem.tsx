import { FC } from 'react';
import { BasePublicPlan, PublicOfferingDetails } from 'waldur-js-client';

import { TabbedPlanComponents } from '@/marketplace/details/plan/TabbedPlanComponents';

interface PricingPlanItemProps {
  offering: PublicOfferingDetails;
  plan: BasePublicPlan;
}

// The enclosing Plans panel already provides the card, so this renders the
// components straight into it rather than nesting a second one.
export const PublicOfferingPricingPlanItem: FC<PricingPlanItemProps> = ({
  offering,
  plan,
}) => <TabbedPlanComponents offering={offering} plan={plan} viewMode />;
