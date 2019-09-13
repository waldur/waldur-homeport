import * as React from 'react';

import { required } from '@waldur/core/validators';
import { StringField, SelectField, FormContainer} from '@waldur/form-react';

export const SlurmForm = ({ translate, container }) => (
  <FormContainer {...container}>
    <SelectField
      name="batch_service"
      label={translate('Batch service')}
      options={[
        {
          label: 'SLURM',
          value: 'SLURM',
        },
        {
          label: 'MOAB',
          value: 'MOAB',
        },
      ]}
      required={true}
      validate={required}
      simpleValue={true}
    />
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
      required={true}
      validate={required}
    />
  </FormContainer>
);
