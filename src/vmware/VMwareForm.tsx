import { get } from 'lodash';
import { FunctionComponent } from 'react';

import { required } from '@waldur/core/validators';
import { StringField, NumberField, SecretField } from '@waldur/form';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { SecretField as PlainSecretField } from '@waldur/marketplace/common/SecretField';
import { FieldEditButton } from '@waldur/marketplace/offerings/update/integration/FieldEditButton';
import { OfferingEditPanelFormProps } from '@waldur/marketplace/offerings/update/integration/types';

const fields = [
  {
    label: translate('Hostname'),
    key: 'service_attributes.backend_url',
    component: StringField,
    fieldProps: { required: true, validate: required },
  },
  {
    label: translate('Username'),
    key: 'service_attributes.username',
    component: StringField,
    fieldProps: { required: true, validate: required },
  },
  {
    label: translate('Password'),
    key: 'service_attributes.password',
    component: SecretField,
    fieldProps: { required: true, validate: required },
  },
  {
    label: translate('Default cluster label'),
    key: 'service_attributes.default_cluster_label',
    component: StringField,
    fieldProps: { required: true, validate: required },
  },
  {
    label: translate('Maximum vCPU for each VM'),
    key: 'service_attributes.max_cpu',
    component: NumberField,
  },
  {
    label: translate('Maximum RAM for each VM'),
    key: 'service_attributes.max_ram',
    component: NumberField,
    fieldProps: {
      unit: 'GB',
      format: (v) => (v ? v / 1024 : ''),
      normalize: (v) => Number(v) * 1024,
    },
  },
  {
    label: translate('Maximum capacity for each disk'),
    key: 'service_attributes.max_disk',
    component: NumberField,
    fieldProps: {
      unit: 'GB',
      format: (v) => (v ? v / 1024 : ''),
      normalize: (v) => Number(v) * 1024,
    },
  },
  {
    label: translate('Maximum total size of the disk space per VM'),
    key: 'service_attributes.max_disk_total',
    component: NumberField,
    fieldProps: {
      unit: 'GB',
      format: (v) => (v ? v / 1024 : ''),
      normalize: (v) => Number(v) * 1024,
    },
  },
];

export const VMwareForm: FunctionComponent<OfferingEditPanelFormProps> = (
  props,
) =>
  fields.map((field) => (
    <FormTable.Item
      key={field.key}
      label={field.label}
      value={
        field.component === SecretField ? (
          <PlainSecretField value={get(props.offering, field.key)} />
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
          fieldProps={field.fieldProps}
        />
      }
    />
  ));
