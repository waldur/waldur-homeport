import * as React from 'react';
import { Field } from 'redux-form';

import { latinName } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';

import { FormGroup } from './FormGroup';

export const ProductCodeField = props => (
  <FormGroup
    label={translate('Product code')}
    description={translate('Technical name intended for integration and automated reporting.')}>
    <Field
      component="input"
      className="form-control"
      name={props.name}
      type="text"
      validate={latinName}
    />
  </FormGroup>
);
