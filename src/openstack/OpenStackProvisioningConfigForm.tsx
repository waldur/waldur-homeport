import { FC } from 'react';

import { NumberField, StringField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { CommaSeparatedListField } from '@waldur/form/CommaSeparatedListField';
import { translate } from '@waldur/i18n';
import {
  DefaultOfferingEditPanel,
  OfferingEditField,
} from '@waldur/marketplace/offerings/update/DefaultOfferingEditPanel';
import { OfferingEditPanelFormProps } from '@waldur/marketplace/offerings/update/integration/types';

import { OpenStackPluginOptionsForm } from './OpenStackPluginOptionsForm';
import { OpenStackSecretOptionsForm } from './OpenStackSecretOptionsForm';

const openStackFields: OfferingEditField[] = [
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
  {
    label: translate('Default DNS servers'),
    description: translate(
      'Default value for new subnets DNS name servers. Should be defined as list.',
    ),
    key: 'service_attributes.dns_nameservers',
    component: CommaSeparatedListField,
  },
  {
    label: translate('Allow live volume resize'),
    description: translate(
      'Allow live volume resize of system and data volumes',
    ),
    key: 'service_attributes.live_resize_of_volumes_enabled',
    component: AwesomeCheckboxField,
  },
];

export const OpenStackProvisioningConfigForm: FC<OfferingEditPanelFormProps> = (
  props,
) => (
  <>
    <DefaultOfferingEditPanel fields={openStackFields} {...props} />
    <OpenStackSecretOptionsForm {...props} />
    <OpenStackPluginOptionsForm {...props} />
  </>
);
