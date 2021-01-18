import { handlePastSlotsForBookingOffering } from '@waldur/booking/marketplace';

const attributesAfter = require('./fixtures/attributes-after.json');
const attributesBefore = require('./fixtures/attributes-before.json');

jest.mock('moment', () => {
  return () => jest.requireActual('moment')('2021-01-13T13:30:00.000Z');
});

describe('Booking offering time slots', () => {
  it('finds slots which are in the past and sets the time to 20 minutes in the future', () => {
    expect(handlePastSlotsForBookingOffering(attributesBefore)).toEqual(
      attributesAfter,
    );
  });
});
