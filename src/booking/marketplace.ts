import { DateTime } from 'luxon';

import { parseDate } from '@waldur/core/dateUtils';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';

const BookingDetails = lazyComponent(
  () => import('@waldur/booking/BookingDetails'),
  'BookingDetails',
);
const BookingCheckoutSummary = lazyComponent(
  () => import('@waldur/booking/BookingCheckoutSummary'),
  'BookingCheckoutSummary',
);
const UserPluginOptionsForm = lazyComponent(
  () => import('@waldur/marketplace/UserPluginOptionsForm'),
  'UserPluginOptionsForm',
);
const BookingOrderForm = lazyComponent(
  () => import('./deploy/BookingOrderForm'),
  'BookingOrderForm',
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
  const schedules = attributes.schedules.map((schedule) => {
    return parseDate(schedule.start) <= DateTime.now()
      ? {
          ...schedule,
          start: DateTime.utc()
            .plus({ minutes: 20 })
            .toISO({ suppressMilliseconds: true }),
          end: parseDate(schedule.end)
            .toUTC()
            .toISO({ suppressMilliseconds: true }),
        }
      : {
          ...schedule,
          start: parseDate(schedule.start)
            .toUTC()
            .toISO({ suppressMilliseconds: true }),
          end: parseDate(schedule.end)
            .toUTC()
            .toISO({ suppressMilliseconds: true }),
        };
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
  orderFormComponent: BookingOrderForm,
  checkoutSummaryComponent: BookingCheckoutSummary,
  pluginOptionsForm: UserPluginOptionsForm,
  detailsComponent: BookingDetails,
  showComponents: true,
  schedulable: true,
  serializer,
});
