import { get } from 'lodash';
import { FC } from 'react';

import { NumberField, StringField } from '@waldur/form';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { FieldEditButton } from '@waldur/marketplace/offerings/update/integration/FieldEditButton';
import { OfferingEditPanelFormProps } from '@waldur/marketplace/offerings/update/integration/types';

const openStackFields = [
  {
    label: translate('Availability zone'),
    description: translate(
      'Default availability zone for provisioned instances.',
    ),
    key: 'service_attributes.availability_zone',
    component: StringField,
  },
  {
    label: translate(
      'Maximum parallel executions of provisioning operations for instances',
    ),
    key: 'service_attributes.max_concurrent_provision_instance',
    component: NumberField,
  },
  {
    label: translate(
      'Maximum parallel executions of provisioning operations for volumes',
    ),
    key: 'service_attributes.max_concurrent_provision_volume',
    component: NumberField,
  },
  {
    label: translate(
      'Maximum parallel executions of provisioning operations for snapshots',
    ),
    key: 'service_attributes.max_concurrent_provision_snapshot',
    component: NumberField,
  },
  {
    label: translate('Flavor exclude regex'),
    description: translate(
      'Flavors matching this regex expression will not be pulled from the backend.',
    ),
    key: 'service_attributes.flavor_exclude_regex',
    component: StringField,
  },
  {
    label: translate('Blacklisted volume types'),
    description: translate(
      'List of coma-separated volume types which should not be possible to select when creating VM/Volume.',
    ),
    key: 'service_attributes.volume_type_blacklist',
    component: StringField,
  },
  {
    label: translate('Console type'),
    description: translate(
      'Type of console access protocol used by Openstack (novnc, xvpvnc, spice-html5, rdp-html5, serial)',
    ),
    key: 'service_attributes.console_type',
    component: StringField,
  },
  {
    label: translate('Console domain override'),
    description: translate(
      'A client-accessible domain name override in case Openstack is returning an internal domain',
    ),
    key: 'service_attributes.console_domain_override',
    component: StringField,
  },
];

export const OpenStackProvisioningConfigForm: FC<OfferingEditPanelFormProps> = (
  props,
) =>
  openStackFields.map((field) => (
    <FormTable.Item
      key={field.key}
      label={field.label}
      value={get(props.offering, field.key, 'N/A')}
      description={field.description}
      actions={
        <FieldEditButton
          title={props.title}
          scope={props.offering}
          name={field.key}
          callback={props.callback}
          fieldComponent={field.component}
        />
      }
    />
  ));
