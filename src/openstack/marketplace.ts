import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';

import { TENANT_TYPE } from './constants';

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
  onlyOnePlan: true,
  showComponents: true,
  offeringComponentsFilter,
  allowToUpdateService: true,
});
