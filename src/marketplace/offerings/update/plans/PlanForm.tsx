import { Field } from 'react-final-form';

import { required } from '@/core/validators';
import MarkdownEditor from '@/form/MarkdownEditor';
import { StringField } from '@/form/StringField';
import { translate } from '@/i18n';

import { ArticleCodeField } from '../../ArticleCodeField';
import { FormGroup } from '../../FormGroup';

import { PlanBillingPeriodField } from './PlanBillingPeriodField';

export const PlanForm = () => (
  <>
    <FormGroup label={translate('Name')} required={true}>
      <Field name="name" component={StringField as any} validate={required} />
    </FormGroup>
    <FormGroup label={translate('Billing period')} required={true}>
      <PlanBillingPeriodField />
    </FormGroup>
    <FormGroup label={translate('Description')}>
      <Field name="description" component={MarkdownEditor as any} />
    </FormGroup>
    <ArticleCodeField />
  </>
);
