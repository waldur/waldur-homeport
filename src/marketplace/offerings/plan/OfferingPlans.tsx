import * as React from 'react';
import { WrappedFieldArrayProps } from 'redux-form';

import { withTranslation, TranslateProps } from '@waldur/i18n';

import { RemoveButton } from '../RemoveButton';
import { PlanAddButton } from './PlanAddButton';
import { PlanForm } from './PlanForm';

type Props = TranslateProps & WrappedFieldArrayProps<any>;

export const OfferingPlans = withTranslation((props: Props) => (
  <div className="form-group">
    <div className="col-sm-offset-3 col-sm-9">
      {props.fields.map((plan, index) => (
        <div key={index} className="panel panel-default">
          <div className="panel-heading">
            <RemoveButton onClick={() => props.fields.remove(index)}/>
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
