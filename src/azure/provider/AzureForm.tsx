import * as React from 'react';

import { FormContainer, StringField } from '@waldur/form-react';

export const AzureForm = ({ translate, container }) => (
  <FormContainer {...container}>
    <StringField
      name="subscription_id"
      label={translate('Subscription ID')}
      description={translate('In the format of GUID')}
      required={true}
    />
    <StringField
      name="tenant_id"
      label={translate('Tenant ID')}
      description={translate('In the format of GUID')}
      required={true}
    />
    <StringField
      name="client_id"
      label={translate('Client ID')}
      description={translate('In the format of GUID')}
      required={true}
    />
    <StringField
      name="client_secret"
      label={translate('Client secret')}
      description={translate('Azure Active Directory Application Secret')}
      required={true}
    />
  </FormContainer>
);
