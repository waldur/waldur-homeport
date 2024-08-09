import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';
import { Attribute } from '@waldur/marketplace/types';

import { TENANT_TYPE } from './constants';
import { STORAGE_MODE_OPTIONS } from './OpenStackPluginOptionsForm';

const OpenStackPackageDetails = lazyComponent(
  () => import('./OpenStackPackageDetails'),
  'OpenStackPackageDetails',
);
const OpenStackPluginOptionsForm = lazyComponent(
  () => import('./OpenStackPluginOptionsForm'),
  'OpenStackPluginOptionsForm',
);
const OpenstackTenantOrder = lazyComponent(
  () => import('./deploy/OpenstackTenantOrder'),
  'OpenstackTenantOrder',
);

const ServiceSettingsAttributes = (): Attribute[] => [
  {
    key: 'backend_url',
    title: translate('API URL'),
    type: 'string',
  },
  {
    key: 'domain',
    title: translate('Domain name'),
    type: 'string',
  },
  {
    key: 'username',
    title: translate('Username'),
    type: 'string',
  },
  {
    key: 'password',
    title: translate('Password'),
    type: 'password',
  },
  {
    key: 'tenant_name',
    title: translate('Tenant name'),
    type: 'string',
  },
  {
    key: 'external_network_id',
    title: translate('External network ID'),
    type: 'string',
  },
  {
    key: 'availability_zone',
    title: translate('Availability zone'),
    type: 'string',
  },
  {
    key: 'max_concurrent_provision_instance',
    title: translate(
      'Maximum parallel executions of provisioning operations for instances.',
    ),
    type: 'string',
  },
  {
    key: 'max_concurrent_provision_volume',
    title: translate(
      'Maximum parallel executions of provisioning operations for volumes.',
    ),
    type: 'string',
  },
  {
    key: 'max_concurrent_provision_snapshot',
    title: translate(
      'Maximum parallel executions of provisioning operations for snapshots.',
    ),
    type: 'string',
  },
];

const OpenStackOptionsSummary = (): Attribute[] => [
  {
    key: 'storage_mode',
    title: translate('Storage mode'),
    type: 'choice',
    options: STORAGE_MODE_OPTIONS.map(({ label, value }) => ({
      key: value,
      title: label,
    })),
  },
  {
    key: 'snapshot_size_limit_gb',
    title: translate('Snapshot size limit'),
    type: 'integer',
  },
  {
    key: 'default_internal_network_mtu',
    title: translate('Default internal network MTU'),
    type: 'integer',
  },
];

const serializeVolumeTypeLimits = (limits) =>
  Object.keys(limits)
    .filter((key) => key.startsWith('gigabytes_') && limits[key])
    .reduce(
      (r, i) => ({
        ...r,
        [i]: limits[i],
      }),
      {},
    );

const limitSerializer = (limits) =>
  limits && {
    cores: limits.cores,
    ram: limits.ram && limits.ram * 1024,
    storage: limits.storage && limits.storage * 1024,
    ...serializeVolumeTypeLimits(limits),
  };

const limitParser = (limits) =>
  limits && {
    cores: limits.cores,
    ram: limits.ram && limits.ram / 1024,
    storage: limits.storage && limits.storage / 1024,
    ...serializeVolumeTypeLimits(limits),
  };

const offeringComponentsFilter = (formData, components) => {
  const storageMode = (formData.plugin_options || {}).storage_mode || 'fixed';
  if (storageMode == 'fixed') {
    return components.filter((c) =>
      ['ram', 'cores', 'storage'].includes(c.type),
    );
  } else {
    return components.filter((c) => c.type !== 'storage');
  }
};

registerOfferingType({
  type: TENANT_TYPE,
  get label() {
    return translate('OpenStack admin');
  },
  orderFormComponent: OpenstackTenantOrder,
  detailsComponent: OpenStackPackageDetails,
  pluginOptionsForm: OpenStackPluginOptionsForm,
  limitSerializer,
  limitParser,
  providerType: 'OpenStack',
  attributes: ServiceSettingsAttributes,
  optionsSummary: OpenStackOptionsSummary,
  onlyOnePlan: true,
  showComponents: true,
  offeringComponentsFilter,
  allowToUpdateService: true,
});
