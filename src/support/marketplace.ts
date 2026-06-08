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
const DefaultUserManagementSection = lazyComponent(() =>
  import('@/marketplace/offerings/update/integration/UserManagementSection').then(
    (module) => ({
      default: module.DefaultUserManagementSection,
    }),
  ),
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
  userManagementSection: DefaultUserManagementSection,
  serializer,
  showComponents: true,
};

export const SupportOffering: OfferingConfiguration = {
  type: SUPPORT_OFFERING_TYPE,
  get label() {
    return translate('Service Desk');
  },
  ...COMMON_OPTIONS,
  provisioningConfigSection: ServiceDeskProvisioningConfigForm,
};

export const BasicOffering: OfferingConfiguration = {
  type: BASIC_OFFERING_TYPE,
  get label() {
    return translate('Basic');
  },
  ...COMMON_OPTIONS,
};
