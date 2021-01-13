import { handlePastSlotsForBookingOffering } from '@waldur/marketplace/cart/store/effects';

const attributesAfter = require('./fixtures/attributes-after.json');
const attributesBefore = require('./fixtures/attributes-before.json');

jest.mock('moment-timezone', () => {
  return () => jest.requireActual('moment')('2020-01-13T13:30:00+04:00');
});

describe('Booking offering time slots', () => {
  it('it finds slots which are in the past and sets the time to 20 minutes in the future', () => {
    expect(handlePastSlotsForBookingOffering(attributesBefore)).toEqual(
      attributesAfter,
    );
  });
});
