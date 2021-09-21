import { FunctionComponent } from 'react';

import { PlanDetailsTable } from '@waldur/marketplace/details/plan/PlanDetailsTable';
import { Offering, Plan } from '@waldur/marketplace/types';
import './PlanItemExpandableContent.scss';

interface PlanItemExpandableContentProps {
  offering: Offering;
  plan: Plan;
}

export const PlanItemExpandableContent: FunctionComponent<PlanItemExpandableContentProps> = ({
  offering,
  plan,
}) => (
  <div className="planItemExpandableContent">
    <PlanDetailsTable
      offering={offering}
      plan={plan}
      viewMode={true}
      formGroupClassName="form-group row"
      columnClassName="col-sm-12"
    />
  </div>
);
