import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';

import { BASIC_OFFERING_TYPE, SUPPORT_OFFERING_TYPE } from './constants';
import { serializer } from './serializer';

const OfferingConfigurationDetails = lazyComponent(
  () => import('@waldur/support/OfferingConfigurationDetails'),
  'OfferingConfigurationDetails',
);
const OfferingConfigurationForm = lazyComponent(
  () => import('@waldur/support/OfferingConfigurationForm'),
  'OfferingConfigurationForm',
);
const OfferingPluginOptionsForm = lazyComponent(
  () => import('./OfferingPluginOptionsForm'),
  'OfferingPluginOptionsForm',
);
const OfferingPluginSecretOptionsForm = lazyComponent(
  () => import('./OfferingPluginSecretOptionsForm'),
  'OfferingPluginSecretOptionsForm',
);

export const COMMON_OPTIONS = {
  component: OfferingConfigurationForm,
  detailsComponent: OfferingConfigurationDetails,
  pluginOptionsForm: OfferingPluginOptionsForm,
  secretOptionsForm: OfferingPluginSecretOptionsForm,
  serializer,
  showOptions: true,
  showComponents: true,
};

registerOfferingType({
  type: SUPPORT_OFFERING_TYPE,
  get label() {
    return translate('Request-based item');
  },
  ...COMMON_OPTIONS,
});

registerOfferingType({
  type: BASIC_OFFERING_TYPE,
  get label() {
    return translate('Request-based item (without Service Desk)');
  },
  ...COMMON_OPTIONS,
});
