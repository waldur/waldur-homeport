import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { WysiwygEditor } from '@waldur/core/WysiwygEditor';
import { InputField } from '@waldur/form/InputField';
import { translate } from '@waldur/i18n';

import { ArticleCodeField } from '../../ArticleCodeField';
import { FormGroup } from '../../FormGroup';

import { PlanBillingPeriodField } from './PlanBillingPeriodField';

export const PlanForm = () => (
  <>
    <FormGroup label={translate('Name')} required={true}>
      <Field
        name="name"
        type="text"
        component={InputField}
        validate={required}
      />
    </FormGroup>
    <FormGroup label={translate('Billing period')} required={true}>
      <PlanBillingPeriodField />
    </FormGroup>
    <FormGroup label={translate('Description')}>
      <Field name="description" component={WysiwygEditor} />
    </FormGroup>
    <ArticleCodeField />
  </>
);
