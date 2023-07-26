import { FunctionComponent } from 'react';

import { FormContainer, SecretField, StringField } from '@waldur/form';
import { translate } from '@waldur/i18n';

export const RemoteOfferingSecretOptions: FunctionComponent<{
  container;
}> = ({ container }) => (
  <FormContainer {...container}>
    <StringField name="api_url" label={translate('API URL')} />
    <SecretField name="token" label={translate('Token')} />
    <StringField name="customer_uuid" label={translate('Organization UUID')} />
  </FormContainer>
);
