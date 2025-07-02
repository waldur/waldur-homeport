import { FunctionComponent } from 'react';

import { required } from '@waldur/core/validators';
import { SecretField, StringField, TextField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import {
  DefaultOfferingEditPanel,
  OfferingEditField,
} from '@waldur/marketplace/offerings/update/DefaultOfferingEditPanel';
import { OfferingEditPanelFormProps } from '@waldur/marketplace/offerings/update/integration/types';

const fields: OfferingEditField[] = [
  {
    label: translate('API URL'),
    key: 'service_attributes.backend_url',
    description: translate(
      'Keystone auth URL (e.g. http://keystone.example.com:5000/v3)',
    ),
    component: StringField,
    fieldProps: { required: true, validate: required },
  },
  {
    label: translate('Domain name'),
    key: 'service_attributes.domain',
    component: StringField,
  },
  {
    label: translate('Username'),
    key: 'service_attributes.username',
    description: translate('Tenant user username'),
    component: StringField,
    fieldProps: { required: true, validate: required },
  },
  {
    label: translate('Password'),
    key: 'service_attributes.password',
    description: translate('Tenant user password'),
    component: SecretField,
    fieldProps: { required: true, validate: required },
  },
  {
    label: translate('Tenant name'),
    key: 'service_attributes.tenant_name',
    component: StringField,
    fieldProps: { required: true, validate: required },
  },
  {
    label: translate('External network ID'),
    key: 'service_attributes.external_network_id',
    description: translate(
      'It is used to automatically assign floating IP to your virtual machine.',
    ),
    component: StringField,
    fieldProps: { required: true, validate: required },
  },
  {
    label: translate('Openstack API TLS certificate'),
    key: 'secret_options.openstack_api_tls_certificate',
    component: TextField,
  },
  {
    label: translate('Verify server certificate'),
    key: 'service_attributes.verify_ssl',
    component: AwesomeCheckboxField,
    hideLabel: true,
  },
];

export const OpenStackForm: FunctionComponent<OfferingEditPanelFormProps> = (
  props,
) => <DefaultOfferingEditPanel fields={fields} {...props} />;
