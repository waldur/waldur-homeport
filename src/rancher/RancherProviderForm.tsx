import { FunctionComponent } from 'react';

import { required } from '@waldur/core/validators';
import { SecretField, StringField, TextField, SelectField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import {
  DefaultOfferingEditPanel,
  OfferingEditField,
} from '@waldur/marketplace/offerings/update/DefaultOfferingEditPanel';
import { OfferingEditPanelFormProps } from '@waldur/marketplace/offerings/update/integration/types';

export const RANCHER_NODE_DISK_DRIVER_OPTIONS = [
  {
    label: 'VD',
    value: 'vd',
  },
  {
    label: 'SD',
    value: 'sd',
  },
];

const fields: OfferingEditField[] = [
  {
    label: translate('Rancher server URL'),
    key: 'service_attributes.backend_url',
    component: StringField,
    fieldProps: { required: true, validate: required },
  },
  {
    label: translate('Rancher access key'),
    key: 'service_attributes.username',
    component: StringField,
    fieldProps: { required: true, validate: required },
  },
  {
    label: translate('Rancher secret key'),
    key: 'service_attributes.password',
    component: SecretField,
    fieldProps: { required: true, validate: required },
  },
  {
    label: translate('Base image name'),
    key: 'service_attributes.base_image_name',
    component: StringField,
    fieldProps: { required: true, validate: required },
  },
  {
    label: translate('Private registry URL'),
    key: 'service_attributes.private_registry_url',
    component: StringField,
  },
  {
    label: translate('Private registry username'),
    key: 'service_attributes.private_registry_user',
    component: StringField,
  },
  {
    label: translate('Private registry password'),
    key: 'service_attributes.private_registry_password',
    component: SecretField,
  },
  {
    label: translate('Cloud init template'),
    key: 'service_attributes.cloud_init_template',
    component: TextField,
  },
  {
    label: translate('Node disk driver type'),
    key: 'service_attributes.node_disk_driver',
    component: SelectField,
    fieldProps: {
      options: RANCHER_NODE_DISK_DRIVER_OPTIONS,
      simpleValue: true,
      isClearable: false,
    },
  },
];

export const RancherProviderForm: FunctionComponent<
  OfferingEditPanelFormProps
> = (props) => <DefaultOfferingEditPanel fields={fields} {...props} />;
