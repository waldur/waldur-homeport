import { FunctionComponent } from 'react';
import { compose } from 'redux';
import { Field, FormSection } from 'redux-form';

import { required } from '@waldur/core/validators';
import { withTranslation, TranslateProps } from '@waldur/i18n';
import { WysiwygEditor } from '@waldur/marketplace/offerings/create/WysiwygEditor';
import { OfferingComponent } from '@waldur/marketplace/types';

import { ArticleCodeField } from '../ArticleCodeField';
import { FormGroup } from '../FormGroup';

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

const PlanNameField: FunctionComponent = () => (
  <Field
    name="name"
    type="text"
    component="input"
    className="form-control"
    validate={required}
  />
);

const PlanDescriptionField: FunctionComponent = () => (
  <Field name="description" component={WysiwygEditor} />
);

const enhance = compose(connectPlanComponents, withTranslation);

export const PlanForm = enhance((props: PlanFormProps) => (
  <FormSection name={props.plan}>
    <FormGroup label={props.translate('Name')} required={true}>
      <PlanNameField />
    </FormGroup>
    <FormGroup label={props.translate('Price')}>
      <PriceField plan={props.plan} />
    </FormGroup>
    <FormGroup label={props.translate('Billing period')} required={true}>
      <PlanBillingPeriodField />
    </FormGroup>
    <FormGroup label={props.translate('Description')}>
      <PlanDescriptionField />
    </FormGroup>
    <ArticleCodeField />
    {props.components && props.components.length > 0 && (
      <PlanComponents
        components={props.components.filter((component) => component.type)}
        limits={props.limits}
        archived={props.archived}
      />
    )}
  </FormSection>
));
