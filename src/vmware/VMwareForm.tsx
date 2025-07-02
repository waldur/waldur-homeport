import { FunctionComponent } from 'react';

import { required } from '@waldur/core/validators';
import { NumberField, SecretField, StringField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import {
  DefaultOfferingEditPanel,
  OfferingEditField,
} from '@waldur/marketplace/offerings/update/DefaultOfferingEditPanel';
import { OfferingEditPanelFormProps } from '@waldur/marketplace/offerings/update/integration/types';

const fields: OfferingEditField[] = [
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
) => <DefaultOfferingEditPanel fields={fields} {...props} />;
