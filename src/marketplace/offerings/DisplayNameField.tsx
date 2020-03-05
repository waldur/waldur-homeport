import * as React from 'react';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';

import { FormGroup } from './FormGroup';

interface DisplayNameFieldProps {
  name: string;
}

export const DisplayNameField = (props: DisplayNameFieldProps) => (
  <FormGroup
    label={translate('Display name')}
    required={true}
    description={translate('Label that is visible to users in Marketplace.')}
  >
    <Field
      component="input"
      className="form-control"
      name={props.name}
      type="text"
      validate={required}
    />
  </FormGroup>
);
