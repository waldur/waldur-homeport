import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';
import { Attribute } from '@waldur/marketplace/types';

const OpenStackPackageDetails = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "OpenStackPackageDetails" */ './OpenStackPackageDetails'
    ),
  'OpenStackPackageDetails',
);
const OpenStackPackageForm = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "OpenStackPackageForm" */ './OpenStackPackageForm'
    ),
  'OpenStackPackageForm',
);
const OpenStackPluginOptionsForm = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "OpenStackPluginOptionsForm" */ './OpenStackPluginOptionsForm'
    ),
  'OpenStackPluginOptionsForm',
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
  type: 'OpenStack.Admin',
  get label() {
    return translate('OpenStack admin');
  },
  component: OpenStackPackageForm,
  detailsComponent: OpenStackPackageDetails,
  pluginOptionsForm: OpenStackPluginOptionsForm,
  limitSerializer,
  limitParser,
  providerType: 'OpenStack',
  attributes: ServiceSettingsAttributes,
  onlyOnePlan: true,
  showComponents: true,
  offeringComponentsFilter,
  allowToUpdateService: true,
});
