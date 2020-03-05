import * as React from 'react';

import { required } from '@waldur/core/validators';
import {
  FormContainer,
  StringField,
  SecretField,
  TextField,
} from '@waldur/form-react';

export const RancherProviderForm = ({ translate, container }) => (
  <FormContainer {...container}>
    <StringField
      name="backend_url"
      label={translate('Rancher server URL')}
      required={true}
      validate={required}
    />
    <StringField
      name="username"
      label={translate('Rancher access key')}
      required={true}
      validate={required}
    />
    <SecretField
      name="password"
      label={translate('Rancher secret key')}
      required={true}
      validate={required}
    />
    <StringField
      name="base_image_name"
      label={translate('Base image name')}
      required={true}
      validate={required}
    />
    <TextField
      name="cloud_init_template"
      label={translate('Cloud init template')}
    />
  </FormContainer>
);
