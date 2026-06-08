import { FC } from 'react';

import { required } from '@/core/validators';
import {
  SecretEditField,
  SelectEditField,
  StringEditField,
  TextEditField,
} from '@/form/editFields';
import { translate } from '@/i18n';
import { BaseCredentialsSection } from '@/marketplace/offerings/update/integration/BaseCredentialsSection';
import { OfferingEditPanelProps } from '@/marketplace/offerings/update/integration/types';

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

export const RancherCredentialsSection: FC<OfferingEditPanelProps> = (
  props,
) => {
  return (
    <BaseCredentialsSection {...props}>
      <StringEditField
        name="service_attributes.backend_url"
        label={translate('Rancher server URL')}
        required
        validate={required}
      />
      <StringEditField
        name="service_attributes.username"
        label={translate('Rancher access key')}
        required
        validate={required}
      />
      <SecretEditField
        name="service_attributes.password"
        label={translate('Rancher secret key')}
        required
        validate={required}
      />
      <StringEditField
        name="service_attributes.base_image_name"
        label={translate('Base image name')}
        required
        validate={required}
      />
      <StringEditField
        name="service_attributes.private_registry_url"
        label={translate('Private registry URL')}
      />
      <StringEditField
        name="service_attributes.private_registry_user"
        label={translate('Private registry username')}
      />
      <SecretEditField
        name="service_attributes.private_registry_password"
        label={translate('Private registry password')}
      />
      <TextEditField
        name="service_attributes.cloud_init_template"
        label={translate('Cloud init template')}
      />
      <SelectEditField
        name="service_attributes.node_disk_driver"
        label={translate('Node disk driver type')}
        options={RANCHER_NODE_DISK_DRIVER_OPTIONS}
        simpleValue
        isClearable={false}
      />
    </BaseCredentialsSection>
  );
};
