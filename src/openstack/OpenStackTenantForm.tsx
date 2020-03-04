import * as React from 'react';

import { StringField, SecretField, FormContainer } from '@waldur/form-react';

export const OpenStackTenantForm = ({ translate, container }) => (
  <FormContainer {...container}>
    <StringField
      name="backend_url"
      label={translate('API URL')}
      required={true}
      description={translate(
        'Keystone auth URL (e.g. http://keystone.example.com:5000/v3)',
      )}
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
      name="tenant_id"
      label={translate('Tenant ID')}
      required={true}
    />
    <StringField
      name="external_network_id"
      label={translate('External network ID')}
      required={true}
      description={translate(
        'It is used to automatically assign floating IP to your virtual machine.',
      )}
    />
    <StringField
      name="domain"
      label={translate('Domain')}
      description={translate(
        'Domain name. If not defined default domain will be used.',
      )}
    />
    <StringField
      name="availability_zone"
      label={translate('Availability zone')}
      description={translate(
        'Default availability zone for provisioned instances.',
      )}
    />
    <StringField
      name="flavor_exclude_regex"
      label={translate('Flavor exclude regex')}
      description={translate(
        'Flavors matching this regex expression will not be pulled from the backend.',
      )}
    />
  </FormContainer>
);
