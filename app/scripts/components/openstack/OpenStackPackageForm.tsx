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

const required = value => value ? undefined : 'Required';

export const OpenStackPackageForm = props => (
  <form className="form-horizontal">
    <FormContainer
      submitting={false}
      labelClass="col-sm-3"
      controlClass="col-sm-9">
      <StringField
        label={translate('Tenant name')}
        name="attributes.name"
        validate={required}
        required={true}
      />
      {props.offering.plans && (
        <SelectField
          label={translate('Plan')}
          name="plan"
          labelKey="name"
          valueKey="url"
          options={props.offering.plans}
          validate={required}
          required={true}
        />
      )}
      <TextField
        label={translate('Tenant description')}
        name="attributes.description"
      />
      <StringField
        label={translate('Initial admin username')}
        placeholder="generate automatically"
        name="attributes.username"
      />
      <SecretField
        label={translate('Initial admin password')}
        placeholder="generate automatically"
        name="attributes.password"
      />
      <StringField
        label={translate('Internal network mask (CIDR)')}
        name="attributes.subnet_cidr"
      />
      <StringField
        label={translate('Internal network allocation pool')}
        name="attributes.subnet_allocation_pool"
      />
      <CheckboxField
        label={translate('Skip connection to external network')}
        name="attributes.skip_connection_extnet"
      />
    </FormContainer>
  </form>
);
