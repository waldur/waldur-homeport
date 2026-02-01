import { FC } from 'react';
import { BasePublicPlan, PublicOfferingDetails } from 'waldur-js-client';

import { Panel } from '@waldur/core/Panel';
import { PlanDescriptionButton } from '@waldur/marketplace/details/plan/PlanDescriptionButton';
import { TabbedPlanComponents } from '@waldur/marketplace/details/plan/TabbedPlanComponents';

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
      title={plan.name}
      titleClassName="fw-normal"
      actions={<PlanDescriptionButton planDescription={plan.description} />}
      cardBordered
    >
      <TabbedPlanComponents offering={offering} plan={plan} viewMode />
    </Panel>
  );
};
