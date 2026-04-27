import { FC } from 'react';
import { BasePublicPlan, PublicOfferingDetails } from 'waldur-js-client';

import { Panel } from '@/core/Panel';
import { PlanDescriptionButton } from '@/marketplace/details/plan/PlanDescriptionButton';
import { TabbedPlanComponents } from '@/marketplace/details/plan/TabbedPlanComponents';

interface PricingPlanItemProps {
  offering: PublicOfferingDetails;
  plan: BasePublicPlan;
}

export const PublicOfferingPricingPlanItem: FC<PricingPlanItemProps> = ({
  offering,
  plan,
}) => {
  return (
    <Panel
      actions={<PlanDescriptionButton planDescription={plan.description} />}
      cardBordered
    >
      <TabbedPlanComponents offering={offering} plan={plan} viewMode />
    </Panel>
  );
};
