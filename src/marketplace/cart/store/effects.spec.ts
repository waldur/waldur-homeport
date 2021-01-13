// import { advanceTo } from 'jest-date-mock';

import { handlePastSlotsForBookingOffering } from '@waldur/marketplace/cart/store/effects';

const attributesAfter = require('./fixtures/attributes-after.json');
const attributesBefore = require('./fixtures/attributes-before.json');

jest.mock('moment', () => {
  return () => jest.requireActual('moment')('2021-01-13T13:30:00+00:00');
});

jest.mock('moment-timezone', () => {
  return () =>
    jest.requireActual('moment-timezone')('2021-01-13T13:30:00+00:00');
});

describe('Booking offering time slots', () => {
  it('finds slots which are in the past and sets the time to 20 minutes in the future', () => {
    // advanceTo(new Date(2021, 1, 13, 13, 30, 0));
    // advanceTo(new Date('2021-01-13T13:30:00+00:00'));
    expect(handlePastSlotsForBookingOffering(attributesBefore)).toEqual(
      attributesAfter,
    );
  });
});
