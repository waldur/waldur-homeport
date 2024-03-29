import { FunctionComponent } from 'react';

import { required } from '@waldur/core/validators';
import {
  StringField,
  SecretField,
  FormContainer,
  NumberField,
} from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';

export const OpenStackForm: FunctionComponent<{ container }> = ({
  container,
}) => (
  <FormContainer {...container}>
    <StringField
      name="backend_url"
      label={translate('API URL')}
      required={true}
      validate={required}
      description={translate(
        'Keystone auth URL (e.g. http://keystone.example.com:5000/v3)',
      )}
    />
    <StringField name="domain" label={translate('Domain name')} />
    <StringField
      name="username"
      label={translate('Username')}
      required={true}
      validate={required}
      description={translate('Tenant user username')}
    />
    <SecretField
      name="password"
      label={translate('Password')}
      required={true}
      validate={required}
      description={translate('Tenant user password')}
    />
    <StringField
      name="tenant_name"
      label={translate('Tenant name')}
      required={true}
      validate={required}
    />
    <StringField
      name="external_network_id"
      label={translate('External network ID')}
      required={true}
      validate={required}
      description={translate(
        'It is used to automatically assign floating IP to your virtual machine.',
      )}
    />
    <StringField
      name="availability_zone"
      label={translate('Availability zone')}
      description={translate(
        'Default availability zone for provisioned instances.',
      )}
    />
    <AwesomeCheckboxField
      hideLabel={true}
      label={translate('Verify server certificate')}
      name="verify_ssl"
    />
    <NumberField
      label={translate(
        'Maximum parallel executions of provisioning operations for instances.',
      )}
      name="max_concurrent_provision_instance"
    />
    <NumberField
      label={translate(
        'Maximum parallel executions of provisioning operations for volumes.',
      )}
      name="max_concurrent_provision_volume"
    />
    <NumberField
      label={translate(
        'Maximum parallel executions of provisioning operations for snapshots.',
      )}
      name="max_concurrent_provision_snapshot"
    />
  </FormContainer>
);
