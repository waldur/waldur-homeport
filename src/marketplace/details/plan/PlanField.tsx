import * as React from 'react';

import { translate } from '@waldur/i18n';
import { PlanDescriptionButton } from '@waldur/marketplace/details/plan/PlanDescriptionButton';
import { PlanSelectField } from '@waldur/marketplace/details/plan/PlanSelectField';
import { Offering } from '@waldur/marketplace/types';

interface PlanFieldProps {
  offering?: Offering;
}

export const PlanField = (props: PlanFieldProps) => props.offering.plans.length > 0 ? (
  <div className="form-group">
    <label className="control-label col-sm-3">
      {translate('Plan')}
      <span className="text-danger"> *</span>
    </label>
    <div className="col-sm-9">
      <div style={{display: 'flex', justifyContent: 'space-between'}}>
        <div style={{flexGrow: 1}}>
          <PlanSelectField plans={props.offering.plans.filter(plan => plan.archived === false)}/>
        </div>
        <PlanDescriptionButton className="btn btn-md btn-default pull-right m-l-sm"/>
      </div>
    </div>
  </div>
) : null;
