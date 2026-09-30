import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BookingResource } from '../types';

import { BookingResourcesCalendar } from './BookingResourcesCalendar';

const makeResource = (overrides: Partial<BookingResource>): BookingResource =>
  ({
    uuid: 'r1',
    name: 'Booking',
    state: 'OK',
    ...overrides,
  }) as BookingResource;

// Day buttons are labelled like "Friday, January 10th, 2025".
const day = (label: string) =>
  screen.getByRole('button', { name: new RegExp(label) });

// Crash safety for malformed resources; which days are enabled and what a
// pick lists are covered by the component's stories.
describe('BookingResourcesCalendar', () => {
  beforeEach(() => {
    // Shows January and February 2025, where the fixtures' schedules are.
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2025, 0, 5, 12, 0));
  });
  afterEach(() => vi.useRealTimers());

  // Regression: the resource-details "Booking" tab passes a raw marketplace
  // resource whose attributes may have no `schedules` key. This used to throw
  // "Cannot read properties of undefined (reading 'map')" and crash the page.
  it('renders the empty state when a booking resource has no schedules', () => {
    const resource = makeResource({ attributes: {} as any });

    expect(() =>
      render(<BookingResourcesCalendar bookingResources={[resource]} />),
    ).not.toThrow();

    expect(screen.getByText('Select a date')).toBeInTheDocument();
    expect(day('January 10th, 2025')).toBeDisabled();
  });

  it('does not crash when attributes itself is undefined', () => {
    const resource = makeResource({ attributes: undefined });

    expect(() =>
      render(<BookingResourcesCalendar bookingResources={[resource]} />),
    ).not.toThrow();

    expect(screen.getByText('Select a date')).toBeInTheDocument();
  });

  it('does not crash when the resource list itself is undefined', () => {
    expect(() =>
      render(<BookingResourcesCalendar bookingResources={undefined as any} />),
    ).not.toThrow();

    expect(screen.getByText('Select a date')).toBeInTheDocument();
  });

  it('ignores resources without schedules while keeping those that have them', () => {
    const withSchedules = makeResource({
      uuid: 'with',
      attributes: {
        schedules: [
          { start: '2025-01-20T09:00:00Z', end: '2025-01-20T10:00:00Z' },
        ],
      },
    });
    const withoutSchedules = makeResource({
      uuid: 'without',
      attributes: {} as any,
    });

    expect(() =>
      render(
        <BookingResourcesCalendar
          bookingResources={[withSchedules, withoutSchedules]}
        />,
      ),
    ).not.toThrow();

    expect(day('January 20th, 2025')).toBeEnabled();
    expect(day('January 21st, 2025')).toBeDisabled();
  });
});
