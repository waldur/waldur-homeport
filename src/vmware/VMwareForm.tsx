import * as React from 'react';

import { required } from '@waldur/core/validators';
import {
  FormContainer,
  StringField,
  NumberField,
  SecretField,
} from '@waldur/form-react';

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
    <SecretField
      name="password"
      label={translate('Password')}
      required={true}
      validate={required}
    />
    <StringField
      name="default_cluster_label"
      label={translate('Default cluster label')}
      required={true}
      validate={required}
    />
    <NumberField name="max_cpu" label={translate('Maximum vCPU for each VM')} />
    <NumberField
      name="max_ram"
      label={translate('Maximum RAM for each VM')}
      unit="GB"
      format={v => (v ? v / 1024 : '')}
      normalize={v => Number(v) * 1024}
    />
    <NumberField
      name="max_disk"
      label={translate('Maximum capacity for each disk')}
      unit="GB"
      format={v => (v ? v / 1024 : '')}
      normalize={v => Number(v) * 1024}
    />
    <NumberField
      name="max_disk_total"
      label={translate('Maximum total size of the disk space per VM')}
      unit="GB"
      format={v => (v ? v / 1024 : '')}
      normalize={v => Number(v) * 1024}
    />
  </FormContainer>
);
