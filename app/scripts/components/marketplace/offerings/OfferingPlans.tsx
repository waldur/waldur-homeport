import * as React from 'react';

import { withTranslation } from '@waldur/i18n';

import { PlanAddButton } from './PlanAddButton';
import { PlanForm } from './PlanForm';
import { PlanRemoveButton } from './PlanRemoveButton';

export const OfferingPlans = withTranslation(props => (
  <div className="form-group">
    <div className="col-sm-offset-3 col-sm-9">
      {props.fields.map((plan, index) => (
        <div key={index} className="panel panel-default">
          <div className="panel-heading">
            <PlanRemoveButton onClick={() => props.fields.remove(index)}/>
            <h4>{props.translate('Plan #{index}', {index: index + 1})}</h4>
          </div>
          <div className="panel-body">
            <PlanForm plan={plan}/>
          </div>
        </div>
      ))}
      <PlanAddButton onClick={() => props.fields.push({})}/>
    </div>
  </div>
));
