import * as React from 'react';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';

import { FormGroupWithError } from './FormGroupWithError';
import { articleCodeValidator } from './utils';

export const ProductCodeField = () => (
  <Field
    name="product_code"
    validate={articleCodeValidator}
    label={translate('Product code')}
    description={translate(
      'Technical name intended for integration and automated reporting.',
    )}
    component={FormGroupWithError}
  />
);
