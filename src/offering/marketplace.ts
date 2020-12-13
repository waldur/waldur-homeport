import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';

import { serializer } from './serializer';

const OfferingConfigurationDetails = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "OfferingConfigurationDetails" */ '@waldur/offering/OfferingConfigurationDetails'
    ),
  'OfferingConfigurationDetails',
);
const OfferingConfigurationForm = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "OfferingConfigurationForm" */ '@waldur/offering/OfferingConfigurationForm'
    ),
  'OfferingConfigurationForm',
);
const OfferingPluginOptionsForm = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "OfferingPluginOptionsForm" */ './OfferingPluginOptionsForm'
    ),
  'OfferingPluginOptionsForm',
);
const OfferingPluginSecretOptionsForm = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "OfferingPluginSecretOptionsForm" */ './OfferingPluginSecretOptionsForm'
    ),
  'OfferingPluginSecretOptionsForm',
);

registerOfferingType({
  type: 'Support.OfferingTemplate',
  get label() {
    return translate('Request-based item');
  },
  component: OfferingConfigurationForm,
  detailsComponent: OfferingConfigurationDetails,
  pluginOptionsForm: OfferingPluginOptionsForm,
  secretOptionsForm: OfferingPluginSecretOptionsForm,
  serializer,
  showOptions: true,
  showComponents: true,
});

registerOfferingType({
  type: 'Marketplace.Basic',
  get label() {
    return translate('Request-based item (without Service Desk)');
  },
  component: OfferingConfigurationForm,
  detailsComponent: OfferingConfigurationDetails,
  pluginOptionsForm: OfferingPluginOptionsForm,
  secretOptionsForm: OfferingPluginSecretOptionsForm,
  serializer,
  showOptions: true,
  showComponents: true,
});
