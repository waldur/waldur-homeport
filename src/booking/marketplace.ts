import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';
import { OfferingConfigurationDetails } from '@waldur/offering/OfferingConfigurationDetails';
import { OfferingConfigurationForm } from '@waldur/offering/OfferingConfigurationForm';

import { OFFERING_TYPE_BOOKING } from './constants';

registerOfferingType({
  type: OFFERING_TYPE_BOOKING,
  get label() {
    return translate('Booking');
  },
  component: OfferingConfigurationForm,
  detailsComponent: OfferingConfigurationDetails,
  showOptions: true,
  showComponents: true,
  schedulable: true,
});
