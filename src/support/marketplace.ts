import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { OfferingConfiguration } from '@/marketplace/common/types';

import { BASIC_OFFERING_TYPE, SUPPORT_OFFERING_TYPE } from './constants';
import { serializer } from './serializer';

const OfferingConfigurationDetails = lazyComponent(() =>
  import('@/support/OfferingConfigurationDetails').then((module) => ({
    default: module.OfferingConfigurationDetails,
  })),
);
const UserPluginOptionsForm = lazyComponent(() =>
  import('@/marketplace/UserPluginOptionsForm').then((module) => ({
    default: module.UserPluginOptionsForm,
  })),
);
const UserSecretOptionsForm = lazyComponent(() =>
  import('@/marketplace/UserSecretOptionsForm').then((module) => ({
    default: module.UserSecretOptionsForm,
  })),
);
const ServiceDeskProvisioningConfigForm = lazyComponent(() =>
  import('@/support/ServiceDeskProvisioningConfigForm').then((module) => ({
    default: module.ServiceDeskProvisioningConfigForm,
  })),
);
const RequestOrderForm = lazyComponent(() =>
  import('./RequestOrderForm').then((module) => ({
    default: module.RequestOrderForm,
  })),
);

export const COMMON_OPTIONS = {
  orderFormComponent: RequestOrderForm,
  detailsComponent: OfferingConfigurationDetails,
  pluginOptionsForm: UserPluginOptionsForm,
  serializer,
  showComponents: true,
};

export const SupportOffering: OfferingConfiguration = {
  type: SUPPORT_OFFERING_TYPE,
  get label() {
    return translate('Service Desk');
  },
  ...COMMON_OPTIONS,
  secretOptionsForm: UserSecretOptionsForm,
  provisioningConfigForm: ServiceDeskProvisioningConfigForm,
};

export const BasicOffering: OfferingConfiguration = {
  type: BASIC_OFFERING_TYPE,
  get label() {
    return translate('Basic');
  },
  ...COMMON_OPTIONS,
  secretOptionsForm: UserSecretOptionsForm,
};
