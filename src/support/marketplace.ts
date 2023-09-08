import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';
import { Attribute } from '@waldur/marketplace/types';

import { BASIC_OFFERING_TYPE, SUPPORT_OFFERING_TYPE } from './constants';
import { deployOfferingSteps } from './deploy-steps';
import { serializer } from './serializer';

const OfferingConfigurationDetails = lazyComponent(
  () => import('@waldur/support/OfferingConfigurationDetails'),
  'OfferingConfigurationDetails',
);
const OfferingConfigurationForm = lazyComponent(
  () => import('@waldur/support/OfferingConfigurationForm'),
  'OfferingConfigurationForm',
);
const UserPluginOptionsForm = lazyComponent(
  () => import('@waldur/marketplace/UserPluginOptionsForm'),
  'UserPluginOptionsForm',
);
const OfferingPluginSecretOptionsForm = lazyComponent(
  () => import('./OfferingPluginSecretOptionsForm'),
  'OfferingPluginSecretOptionsForm',
);

const OfferingOptionsSummary = (): Attribute[] => [
  {
    key: 'template_confirmation_comment',
    title: translate('Confirmation notification template'),
    type: 'string',
  },
];

export const COMMON_OPTIONS = {
  formSteps: deployOfferingSteps,
  component: OfferingConfigurationForm,
  detailsComponent: OfferingConfigurationDetails,
  pluginOptionsForm: UserPluginOptionsForm,
  optionsSummary: OfferingOptionsSummary,
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
  secretOptionsForm: OfferingPluginSecretOptionsForm,
});

registerOfferingType({
  type: BASIC_OFFERING_TYPE,
  get label() {
    return translate('Request-based item (without Service Desk)');
  },
  ...COMMON_OPTIONS,
  secretOptionsForm: OfferingPluginSecretOptionsForm,
});
