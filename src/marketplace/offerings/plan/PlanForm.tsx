import * as React from 'react';
import { compose } from 'redux';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { withTranslation } from '@waldur/i18n';

import { FormGroup } from '../FormGroup';
import { PlanBillingPeriodField } from './PlanBillingPeriodField';
import { PlanComponents } from './PlanComponents';
import { PriceField } from './PriceField';
import { connectPlanComponents } from './utils';

const PlanNameField = props => (
  <Field
    name={`${props.plan}.name`}
    type="text"
    component="input"
    className="form-control"
    validate={props.validate}
  />
);

const enhance = compose(connectPlanComponents, withTranslation);

export const PlanForm = enhance(props => (
  <>
    <FormGroup label={props.translate('Name')} required={true}>
      <PlanNameField plan={props.plan} validate={required}/>
    </FormGroup>
    <FormGroup label={props.translate('Price')}>
      <PriceField plan={props.plan}/>
    </FormGroup>
    <FormGroup label={props.translate('Billing period')} required={true}>
      <PlanBillingPeriodField plan={props.plan}/>
    </FormGroup>
    {props.components && props.components.length > 0 && (
      <PlanComponents plan={props.plan} components={props.components}/>
    )}
  </>
));
