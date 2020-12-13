import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';

const BookingCheckoutSummary = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "BookingCheckoutSummary" */ '@waldur/booking/BookingCheckoutSummary'
    ),
  'BookingCheckoutSummary',
);
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

import { OFFERING_TYPE_BOOKING } from './constants';

registerOfferingType({
  type: OFFERING_TYPE_BOOKING,
  get label() {
    return translate('Booking');
  },
  checkoutSummaryComponent: BookingCheckoutSummary,
  component: OfferingConfigurationForm,
  detailsComponent: OfferingConfigurationDetails,
  showOptions: true,
  showComponents: true,
  schedulable: true,
});
