import { get } from 'lodash';
import { FunctionComponent } from 'react';

import { CheckOrX } from '@waldur/core/CheckOrX';
import { required } from '@waldur/core/validators';
import { StringField, SecretField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { SecretField as PlainSecretField } from '@waldur/marketplace/common/SecretField';
import { FieldEditButton } from '@waldur/marketplace/offerings/update/integration/FieldEditButton';
import { OfferingEditPanelFormProps } from '@waldur/marketplace/offerings/update/integration/types';

const fields = [
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
    label: translate('Verify server certificate'),
    key: 'service_attributes.verify_ssl',
    component: AwesomeCheckboxField,
    hideLabel: true,
  },
];

export const OpenStackForm: FunctionComponent<OfferingEditPanelFormProps> = (
  props,
) =>
  fields.map((field) => (
    <FormTable.Item
      key={field.key}
      label={field.label}
      description={field.description}
      value={
        field.component === SecretField ? (
          <PlainSecretField value={get(props.offering, field.key)} />
        ) : field.component === AwesomeCheckboxField ? (
          <CheckOrX value={get(props.offering, field.key)} />
        ) : (
          get(props.offering, field.key, 'N/A')
        )
      }
      actions={
        <FieldEditButton
          title={props.title}
          scope={props.offering}
          name={field.key}
          callback={props.callback}
          fieldComponent={field.component}
          hideLabel={field.hideLabel}
          fieldProps={field.fieldProps}
        />
      }
    />
  ));
