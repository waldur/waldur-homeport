import * as React from 'react';
import { compose } from 'redux';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { withTranslation, TranslateProps } from '@waldur/i18n';
import { OfferingComponent } from '@waldur/marketplace/types';

import { ArticleCodeField } from '../ArticleCodeField';
import { FormGroup } from '../FormGroup';
import { ProductCodeField } from '../ProductCodeField';

import { PlanBillingPeriodField } from './PlanBillingPeriodField';
import { PlanComponents } from './PlanComponents';
import { PriceField } from './PriceField';
import { connectPlanComponents } from './utils';

interface PlanFormProps extends TranslateProps {
  archived: boolean;
  components: OfferingComponent[];
  limits: string[];
  plan: string;
}

const PlanNameField = props => (
  <Field
    name={`${props.plan}.name`}
    type="text"
    component="input"
    className="form-control"
    validate={required}
  />
);

const PlanDescriptionField = props => (
  <Field
    name={`${props.plan}.description`}
    component="textarea"
    rows="5"
    maxLength="500"
    className="form-control"
  />
);

const enhance = compose(connectPlanComponents, withTranslation);

export const PlanForm = enhance((props: PlanFormProps) => (
  <>
    <FormGroup label={props.translate('Name')} required={true}>
      <PlanNameField plan={props.plan}/>
    </FormGroup>
    <FormGroup label={props.translate('Price')}>
      <PriceField plan={props.plan}/>
    </FormGroup>
    <FormGroup label={props.translate('Billing period')} required={true}>
      <PlanBillingPeriodField plan={props.plan}/>
    </FormGroup>
    <FormGroup label={props.translate('Description')}>
      <PlanDescriptionField plan={props.plan}/>
    </FormGroup>
    <ArticleCodeField name={`${props.plan}.article_code`}/>
    <ProductCodeField name={`${props.plan}.product_code`}/>
    {props.components && props.components.length > 0 && (
      <PlanComponents
        plan={props.plan}
        components={props.components}
        limits={props.limits}
        archived={props.archived}
      />
    )}
  </>
));
