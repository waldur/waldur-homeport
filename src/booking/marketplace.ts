import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';

import { OfferingConfigurationDetails } from '@waldur/offering/OfferingConfigurationDetails';
import { OfferingConfigurationForm } from '@waldur/offering/OfferingConfigurationForm';

registerOfferingType({
  type: 'Marketplace.Booking',
  get label() {
    return translate('Booking');
  },
  component: OfferingConfigurationForm,
  detailsComponent: OfferingConfigurationDetails,
  showOptions: true,
  showComponents: true,
  schedulable: true,
});
