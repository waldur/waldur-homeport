import * as React from 'react';

import { required } from '@waldur/core/validators';
import { FormContainer, StringField } from '@waldur/form-react';

export const VMwareForm = ({ translate, container }) => (
  <FormContainer {...container}>
    <StringField
      name="backend_url"
      label={translate('Hostname')}
      required={true}
      validate={required}
    />
    <StringField
      name="username"
      label={translate('Username')}
      required={true}
      validate={required}
    />
    <StringField
      name="password"
      label={translate('Password')}
      required={true}
      validate={required}
    />
  </FormContainer>
);
