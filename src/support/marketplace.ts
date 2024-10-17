import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';

import { BASIC_OFFERING_TYPE, SUPPORT_OFFERING_TYPE } from './constants';
import { serializer } from './serializer';

const OfferingConfigurationDetails = lazyComponent(
  () => import('@waldur/support/OfferingConfigurationDetails'),
  'OfferingConfigurationDetails',
);
const UserPluginOptionsForm = lazyComponent(
  () => import('@waldur/marketplace/UserPluginOptionsForm'),
  'UserPluginOptionsForm',
);
const UserSecretOptionsForm = lazyComponent(
  () => import('@waldur/marketplace/UserSecretOptionsForm'),
  'UserSecretOptionsForm',
);
const RequestOrderForm = lazyComponent(
  () => import('./RequestOrderForm'),
  'RequestOrderForm',
);

export const COMMON_OPTIONS = {
  orderFormComponent: RequestOrderForm,
  detailsComponent: OfferingConfigurationDetails,
  pluginOptionsForm: UserPluginOptionsForm,
  serializer,
  showComponents: true,
};

registerOfferingType({
  type: SUPPORT_OFFERING_TYPE,
  get label() {
    return translate('Request-based item');
  },
  ...COMMON_OPTIONS,
  secretOptionsForm: UserSecretOptionsForm,
});

registerOfferingType({
  type: BASIC_OFFERING_TYPE,
  get label() {
    return translate('Request-based item (without Service Desk)');
  },
  ...COMMON_OPTIONS,
  secretOptionsForm: UserSecretOptionsForm,
});
