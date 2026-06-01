import { required } from '@/core/validators';
import { StringGroup, MarkdownGroup, SelectGroup } from '@/form';
import { translate } from '@/i18n';

import { ArticleCodeField } from '../../ArticleCodeField';

import { getBillingPeriods } from './constants';

export const PlanForm = () => (
  <>
    <StringGroup
      name="name"
      validate={required}
      label={translate('Name')}
      required={true}
    />
    <SelectGroup
      name="unit"
      validate={required}
      label={translate('Billing period')}
      options={getBillingPeriods()}
      isClearable={false}
      required={true}
    />
    <MarkdownGroup name="description" label={translate('Description')} />
    <ArticleCodeField />
  </>
);
