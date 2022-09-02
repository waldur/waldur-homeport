import React from 'react';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

import { OptionalNumberField } from './OptionalNumberField';

export const ComponentMaxAvailableLimitField: React.FC = () => (
  <FormGroup
    label={translate('Maximum available limit')}
    description={translate('Maximal safe amount of resource to allocate.')}
  >
    <Field component={OptionalNumberField} name="max_available_limit" />
  </FormGroup>
);
