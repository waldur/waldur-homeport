import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';
import { Attribute } from '@waldur/marketplace/types';

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

const OfferingOptionsSummary = (): Attribute[] => [
  {
    key: 'auto_approve_in_service_provider_projects',
    title: translate('Auto approve in service provider projects'),
    type: 'boolean',
  },
  {
    key: 'template_confirmation_comment',
    title: translate('Confirmation notification template'),
    type: 'string',
  },
  {
    key: 'service_provider_can_create_offering_user',
    title: translate('Allow service provider to create offering users'),
    type: 'boolean',
  },
];

export const COMMON_OPTIONS = {
  component: OfferingConfigurationForm,
  detailsComponent: OfferingConfigurationDetails,
  pluginOptionsForm: OfferingPluginOptionsForm,
  secretOptionsForm: OfferingPluginSecretOptionsForm,
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
});

registerOfferingType({
  type: BASIC_OFFERING_TYPE,
  get label() {
    return translate('Request-based item (without Service Desk)');
  },
  ...COMMON_OPTIONS,
});
