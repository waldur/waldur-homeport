import { FunctionComponent, useContext } from 'react';
import { compose } from 'redux';
import { Field, FieldArray, FormSection } from 'redux-form';

import { required } from '@waldur/core/validators';
import { FormFieldsContext, FormLayoutContext } from '@waldur/form/context';
import { withTranslation, TranslateProps } from '@waldur/i18n';
import { WysiwygEditor } from '@waldur/marketplace/offerings/create/WysiwygEditor';
import { Division, OfferingComponent } from '@waldur/marketplace/types';

import { ArticleCodeField } from '../ArticleCodeField';
import { FormGroup } from '../FormGroup';

import { DivisionsField } from './DivisionsField';
import { PlanBillingPeriodField } from './PlanBillingPeriodField';
import { PlanComponents } from './PlanComponents';
import { PriceField } from './PriceField';
import { connectPlanComponents } from './utils';

interface PlanFormProps extends TranslateProps {
  archived: boolean;
  components: OfferingComponent[];
  limits: string[];
  plan: string;
  divisions?: Division[];
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

const PlanDivisionsField: FunctionComponent = () => (
  <FieldArray name="divisions" component={DivisionsField} />
);

const enhance = compose(connectPlanComponents, withTranslation);

export const PlanForm = enhance((props: PlanFormProps) => {
  const { layout } = useContext(FormLayoutContext);
  const fieldsClassNames = {
    labelClassName: layout === 'vertical' ? 'control-label' : undefined,
    valueClassName: layout === 'vertical' ? '' : undefined,
    classNameWithoutLabel: layout === 'vertical' ? '' : undefined,
  };
  return (
    <FormFieldsContext.Provider value={fieldsClassNames}>
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
        {props.divisions?.length > 0 && (
          <FormGroup label={props.translate('Allowed divisions')}>
            <PlanDivisionsField />
          </FormGroup>
        )}
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
