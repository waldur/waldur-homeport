import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { OfferingConfiguration } from '@/marketplace/common/types';

import { TENANT_TYPE } from './constants';

const OpenStackCredentialsSection = lazyComponent(() =>
  import('./OpenStackCredentialsSection').then((module) => ({
    default: module.OpenStackCredentialsSection,
  })),
);
const OpenStackTenantDetails = lazyComponent(() =>
  import('./OpenStackTenantDetails').then((module) => ({
    default: module.OpenStackTenantDetails,
  })),
);

const OpenStackProvisioningConfigSection = lazyComponent(() =>
  import('./OpenStackProvisioningConfigSection').then((module) => ({
    default: module.OpenStackProvisioningConfigSection,
  })),
);
const OpenstackTenantOrderForm = lazyComponent(() =>
  import('./deploy/OpenstackTenantOrderForm').then((module) => ({
    default: module.OpenstackTenantOrderForm,
  })),
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

const limitSerializer = (limits) => {
  if (!limits) return limits;
  const { cores, ram, storage, ...rest } = limits;
  return {
    ...rest,
    cores,
    ram: ram && ram * 1024,
    storage: storage && storage * 1024,
    ...serializeVolumeTypeLimits(limits),
  };
};

const limitParser = (limits) => {
  if (!limits) return limits;
  const { cores, ram, storage, ...rest } = limits;
  return {
    ...rest,
    cores,
    ram: ram && ram / 1024,
    storage: storage && storage / 1024,
    ...serializeVolumeTypeLimits(limits),
  };
};

const BUILTIN_TYPES = ['ram', 'cores', 'storage'];

const offeringComponentsFilter = (formData, components) => {
  const storageMode = (formData.plugin_options || {}).storage_mode || 'fixed';
  if (storageMode == 'fixed') {
    return components.filter(
      (c) => BUILTIN_TYPES.includes(c.type) || !c.is_builtin,
    );
  } else {
    return components.filter((c) => c.type !== 'storage');
  }
};

export const OpenStackTenantOffering: OfferingConfiguration = {
  type: TENANT_TYPE,
  get label() {
    return translate('OpenStack tenant');
  },
  credentialsSection: OpenStackCredentialsSection,
  orderFormComponent: OpenstackTenantOrderForm,
  detailsComponent: OpenStackTenantDetails,
  provisioningConfigSection: OpenStackProvisioningConfigSection,
  limitSerializer,
  limitParser,
  onlyOnePlan: true,
  showComponents: true,
  offeringComponentsFilter,
};
