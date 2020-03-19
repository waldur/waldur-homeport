import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';
import { OfferingConfigurationDetails } from '@waldur/offering/OfferingConfigurationDetails';
import { OfferingConfigurationForm } from '@waldur/offering/OfferingConfigurationForm';
import { serializer } from '@waldur/offering/serializer';

import { ScriptsForm } from './ScriptsForm';

registerOfferingType({
  type: 'Marketplace.Script',
  get label() {
    return translate('Devops-friendly offering');
  },
  component: OfferingConfigurationForm,
  detailsComponent: OfferingConfigurationDetails,
  secretOptionsForm: ScriptsForm,
  serializer,
  showOptions: true,
  showComponents: true,
});
