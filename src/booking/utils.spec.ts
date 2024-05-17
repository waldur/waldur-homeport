import { advanceTo, clear } from 'jest-date-mock';
import { DateTime } from 'luxon';

import { handlePastSlotsForBookingOffering } from '@waldur/booking/marketplace';

import attributesAfter from './fixtures/attributes-after.json';
import attributesBefore from './fixtures/attributes-before.json';

afterAll(() => {
  clear();
});

describe('Booking offering time slots', () => {
  it('finds slots which are in the past and sets the time to 20 minutes in the future', () => {
    advanceTo(DateTime.fromISO('2021-01-13T13:30:00.000Z').toJSDate());
    expect(handlePastSlotsForBookingOffering(attributesBefore)).toEqual(
      attributesAfter,
    );
  });
});
