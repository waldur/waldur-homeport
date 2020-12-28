import { FunctionComponent } from 'react';

import { required } from '@waldur/core/validators';
import { StringField, FormContainer } from '@waldur/form';

export const SlurmForm: FunctionComponent<{ translate; container }> = ({
  translate,
  container,
}) => (
  <FormContainer {...container}>
    <StringField
      name="hostname"
      label={translate('Hostname')}
      description={translate('Hostname or IP address of master node')}
      required={true}
      validate={required}
    />
    <StringField
      name="username"
      label={translate('Username')}
      required={true}
      validate={required}
    />
    <StringField name="port" label={translate('Port')} />
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
      required={true}
      validate={required}
    />
  </FormContainer>
);
