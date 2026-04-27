import { DateTime } from 'luxon';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';

import { handlePastSlotsForBookingOffering } from '@/booking/marketplace';

import attributesAfter from './fixtures/attributes-after.json';
import attributesBefore from './fixtures/attributes-before.json';

describe('Booking offering time slots', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('finds slots which are in the past and sets the time to 20 minutes in the future', () => {
    vi.setSystemTime(DateTime.fromISO('2021-01-13T13:30:00.000Z').toJSDate());
    expect(handlePastSlotsForBookingOffering(attributesBefore)).toEqual(
      attributesAfter,
    );
  });
});
