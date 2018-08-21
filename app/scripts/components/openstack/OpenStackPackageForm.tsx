import * as React from 'react';

import {
  CheckboxField,
  FormContainer,
  StringField,
  TextField,
  SelectField,
  SecretField
} from '@waldur/form-react';
import { translate } from '@waldur/i18n';

export const OpenStackPackageForm = props => (
  <form className="form-horizontal">
    <FormContainer
      submitting={false}
      labelClass="col-sm-3"
      controlClass="col-sm-9">
      <StringField
        label={translate('Tenant name')}
        name="name"
        required={true}
      />
      <SelectField
        label={translate('Plan')}
        name="plan"
        labelKey="name"
        valueKey="url"
        options={props.offering.plans}
      />
      <TextField
        label={translate('Tenant description')}
        name="description"
      />
      <StringField
        label={translate('Initial admin username')}
        placeholder="generate automatically"
        name="username"
      />
      <SecretField
        label={translate('Initial admin password')}
        placeholder="generate automatically"
        name="password"
      />
      <StringField
        label={translate('Internal network mask (CIDR)')}
        name="subnet_cidr"
      />
      <StringField
        label={translate('Internal network allocation pool')}
        name="subnet_allocation_pool"
      />
      <CheckboxField
        label={translate('Skip connection to external network')}
        name="skip_connection_extnet"
      />
    </FormContainer>
  </form>
);
