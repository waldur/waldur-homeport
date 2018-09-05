import * as React from 'react';
import { Field } from 'redux-form';

import { withTranslation } from '@waldur/i18n';

import { FormGroup } from './FormGroup';
import { OfferingPlanComponents } from './OfferingPlanComponents';
import { PriceField } from './PriceField';
import { PriceUnitField } from './PriceUnitField';

const PlanNameField = props => (
  <Field
    name={`${props.plan}.name`}
    type="text"
    component="input"
    className="form-control"
  />
);

export const PlanForm = withTranslation(props => (
  <>
    <FormGroup label={props.translate('Name')}>
      <PlanNameField plan={props.plan}/>
    </FormGroup>
    <FormGroup label={props.translate('Price')}>
      <PriceField plan={props.plan}/>
    </FormGroup>
    <FormGroup label={props.translate('Billing period')}>
      <PriceUnitField plan={props.plan}/>
    </FormGroup>
    <OfferingPlanComponents plan={props.plan}/>
  </>
));
