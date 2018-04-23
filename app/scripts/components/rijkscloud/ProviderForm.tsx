import * as React from 'react';

import { StringField, FormContainer} from '@waldur/form-react';

export const ProviderForm = ({ translate, container }) => (
  <FormContainer {...container}>
    <StringField
      name="username"
      label={translate('User ID')}
      required={true}
    />
    <StringField
      name="token"
      label={translate('API key')}
      required={true}
    />
  </FormContainer>
);
