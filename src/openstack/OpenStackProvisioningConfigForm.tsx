import { FC } from 'react';

import { NumberField, StringField } from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { CommaSeparatedListField } from '@/form/CommaSeparatedListField';
import { translate } from '@/i18n';
import {
  DefaultOfferingEditPanel,
  OfferingEditField,
} from '@/marketplace/offerings/update/DefaultOfferingEditPanel';
import { OfferingEditPanelFormProps } from '@/marketplace/offerings/update/integration/types';

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
    label: translate('Create highly available Neutron routers'),
    key: 'service_attributes.create_ha_routers',
    component: AwesomeCheckboxField,
  },
  {
    label: translate('Allow live volume resize'),
    description: translate(
      'Allow live volume resize of system and data volumes',
    ),
    key: 'service_attributes.live_resize_of_volumes_enabled',
    component: AwesomeCheckboxField,
  },
  {
    label: translate('Config drive enabled by default'),
    description: translate(
      'A config drive is a small read-only disk attached to the instance at boot, used by cloud-init to deliver metadata, SSH keys and user data without going through the network metadata service (http://169.254.169.254). Enable this when guests cannot reach the metadata service — for example, when the tenant network has no DHCP or sits on an isolated segment. Leave it off when the metadata service is reachable, which is the usual case. Users can override per-instance at order time.',
    ),
    key: 'service_attributes.config_drive',
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
