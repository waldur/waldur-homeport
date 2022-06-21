import { FunctionComponent, useContext } from 'react';
import { Form } from 'react-bootstrap';
import { compose } from 'redux';
import { Field, FormSection } from 'redux-form';

import { required } from '@waldur/core/validators';
import { FormFieldsContext, FormLayoutContext } from '@waldur/form/context';
import { translate } from '@waldur/i18n';
import { WysiwygEditor } from '@waldur/marketplace/offerings/create/WysiwygEditor';
import { OfferingComponent } from '@waldur/marketplace/types';

import { ArticleCodeField } from '../ArticleCodeField';
import { FormGroup } from '../FormGroup';

import { PlanBillingPeriodField } from './PlanBillingPeriodField';
import { PlanComponents } from './PlanComponents';
import { PriceField } from './PriceField';
import { connectPlanComponents } from './utils';

interface PlanFormProps {
  archived: boolean;
  components: OfferingComponent[];
  limits: string[];
  plan: string;
}

const PlanNameField: FunctionComponent = () => (
  <Field name="name" type="text" component={Form.Control} validate={required} />
);

const PlanDescriptionField: FunctionComponent = () => (
  <Field name="description" component={WysiwygEditor} />
);

const enhance = compose(connectPlanComponents);

export const PlanForm = enhance((props: PlanFormProps) => {
  const { layout } = useContext(FormLayoutContext);
  const fieldsClassNames = {
    labelClassName: layout === 'vertical' ? '' : undefined,
    valueClassName: layout === 'vertical' ? '' : undefined,
    classNameWithoutLabel: layout === 'vertical' ? '' : undefined,
  };
  return (
    <FormFieldsContext.Provider value={fieldsClassNames}>
      <FormSection name={props.plan}>
        <FormGroup label={translate('Name')} required={true}>
          <PlanNameField />
        </FormGroup>
        <FormGroup label={translate('Price')}>
          <PriceField plan={props.plan} />
        </FormGroup>
        <FormGroup label={translate('Billing period')} required={true}>
          <PlanBillingPeriodField />
        </FormGroup>
        <FormGroup label={translate('Description')}>
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
    </FormFieldsContext.Provider>
  );
});
