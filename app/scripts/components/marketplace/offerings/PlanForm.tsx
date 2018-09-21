import * as React from 'react';
import { compose } from 'redux';
import { Field, FieldArray } from 'redux-form';

import { withTranslation } from '@waldur/i18n';

import { CustomPlanComponents } from './CustomPlanComponents';
import { FixedPlanComponents } from './FixedPlanComponents';
import { FormGroup } from './FormGroup';
import { PlanBillingPeriodField } from './PlanBillingPeriodField';
import { PriceField } from './PriceField';
import { connectPlanComponents } from './utils';

const PlanNameField = props => (
  <Field
    name={`${props.plan}.name`}
    type="text"
    component="input"
    className="form-control"
  />
);

const enhance = compose(connectPlanComponents, withTranslation);

export const PlanForm = enhance(props => (
  <>
    <FormGroup label={props.translate('Name')}>
      <PlanNameField plan={props.plan}/>
    </FormGroup>
    <FormGroup label={props.translate('Price')}>
      <PriceField plan={props.plan}/>
    </FormGroup>
    <FormGroup label={props.translate('Billing period')}>
      <PlanBillingPeriodField plan={props.plan}/>
    </FormGroup>
    {props.components && props.components.length > 0 ? (
      <FixedPlanComponents plan={props.plan} components={props.components}/>
    ) : (
      <FieldArray name={`${props.plan}.customComponents`} component={CustomPlanComponents} />
    )}
  </>
));
