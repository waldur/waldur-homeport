import { DateTime } from 'luxon';

import { parseDate } from '@/core/dateUtils';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { OfferingConfiguration } from '@/marketplace/common/types';

import { OFFERING_TYPE_BOOKING } from './constants';

const BookingDetails = lazyComponent(() =>
  import('@/booking/BookingDetails').then((module) => ({
    default: module.BookingDetails,
  })),
);
const BookingCheckoutSummary = lazyComponent(() =>
  import('@/booking/BookingCheckoutSummary').then((module) => ({
    default: module.BookingCheckoutSummary,
  })),
);
const UserPluginOptionsForm = lazyComponent(() =>
  import('@/marketplace/UserPluginOptionsForm').then((module) => ({
    default: module.UserPluginOptionsForm,
  })),
);
const BookingOrderForm = lazyComponent(() =>
  import('./deploy/BookingOrderForm').then((module) => ({
    default: module.BookingOrderForm,
  })),
);

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

export const BookingOffering: OfferingConfiguration = {
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
};
