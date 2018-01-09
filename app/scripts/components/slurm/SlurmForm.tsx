import * as React from 'react';

import { StringField, FormContainer} from '@waldur/form-react';

export const SlurmForm = ({ translate, container }) => (
  <FormContainer {...container}>
    <StringField
      name="hostname"
      label={translate('Hostname')}
      description={translate('Hostname or IP address of master node')}
      required={true}
    />
    <StringField
      name="username"
      label={translate('Username')}
      required={true}
    />
    <StringField
      name="port"
      label={translate('Port')}
    />
    <StringField
      name="gateway"
      label={translate('Gateway')}
      description={translate('Hostname or IP address of gateway node')}
    />
    <StringField
      name="use_sudo"
      label={translate('Use sudo')}
      description={translate('Set to true to activate privilege escalation')}
    />
    <StringField
      name="default_account"
      label={translate('Default account')}
      description={translate('Default SLURM account for user')}
    />
  </FormContainer>
);
