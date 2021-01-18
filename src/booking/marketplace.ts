import moment from 'moment';

import { convertDateTimeToUTCString } from '@waldur/core/dateUtils';
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

/* Since back-end doesn't allow slots in the past,
 * this function detects slots that are in the past and
 * sets the time to 20 minutes later in the future.
 * We add a small buffer that corresponds to max time spend on creating a booking
 */
export const handlePastSlotsForBookingOffering = (attributes) => {
  if (!attributes.schedules) {
    return attributes;
  }
  const currentTimePlus20Minutes = moment().utc().add(20, 'minutes').format();
  const schedules = attributes.schedules.map((schedule) => {
    const utcSchedule = {
      ...schedule,
      start: convertDateTimeToUTCString(schedule.start),
      end: convertDateTimeToUTCString(schedule.end),
    };
    return moment(utcSchedule.start).isSameOrBefore()
      ? {
          ...utcSchedule,
          start: currentTimePlus20Minutes,
        }
      : utcSchedule;
  });
  return {
    ...attributes,
    schedules,
  };
};

const serializer = (attrs) => handlePastSlotsForBookingOffering(attrs);

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
  serializer,
});
