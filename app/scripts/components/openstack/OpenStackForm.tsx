import * as React from 'react';

import { StringField, SecretField, FormContainer} from '@waldur/form-react';

export const OpenStackForm = ({ translate, container }) => (
  <FormContainer {...container}>
    <StringField
      name="backend_url"
      label={translate('API URL')}
      required={true}
      description={translate('Keystone auth URL (e.g. http://keystone.example.com:5000/v3)')}
    />
    <StringField
      name="username"
      label={translate('Username')}
      required={true}
      description={translate('Tenant user username')}
    />
    <SecretField
      name="password"
      label={translate('Password')}
      required={true}
      description={translate('Tenant user password')}
    />
    <StringField
      name="tenant_name"
      label={translate('Tenant name')}
      required={true}
    />
    <StringField
      name="external_network_id"
      label={translate('External network ID')}
      required={true}
      description={translate('It is used to automatically assign floating IP to your virtual machine.')}
    />
    <StringField
      name="availability_zone"
      label={translate('Availability zone')}
      description={translate('Default availability zone for provisioned instances.')}
    />
  </FormContainer>
);
