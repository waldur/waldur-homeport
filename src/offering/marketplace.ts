import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';
import { OfferingConfigurationDetails } from '@waldur/offering/OfferingConfigurationDetails';
import { OfferingConfigurationForm } from '@waldur/offering/OfferingConfigurationForm';

import { OfferingPluginOptionsForm } from './OfferingPluginOptionsForm';
import { serializer } from './serializer';

registerOfferingType({
  type: 'Support.OfferingTemplate',
  get label() {
    return translate('Request-based item');
  },
  component: OfferingConfigurationForm,
  detailsComponent: OfferingConfigurationDetails,
  pluginOptionsForm: OfferingPluginOptionsForm,
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
  serializer,
  showOptions: true,
  showComponents: true,
});
