import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BookingResource } from '../types';

import { BookingResourcesCalendar } from './BookingResourcesCalendar';

// Flatpickr does not render reliably under jsdom; stub it and capture the
// props it receives so we can assert the computed `enable` ranges without a
// real date picker.
const { flatpickrSpy } = vi.hoisted(() => ({ flatpickrSpy: vi.fn() }));
vi.mock('react-flatpickr', () => ({
  default: (props: any) => {
    flatpickrSpy(props);
    return <div data-testid="flatpickr" />;
  },
}));

// Avoids pulling in the theme/Redux machinery and dynamic CSS imports.
vi.mock('@/form/useFlatpickrTheme', () => ({
  useFlatpickrTheme: vi.fn(),
}));

const makeResource = (overrides: Partial<BookingResource>): BookingResource =>
  ({
    uuid: 'r1',
    name: 'Booking',
    state: 'OK',
    ...overrides,
  }) as BookingResource;

describe('BookingResourcesCalendar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Regression: the resource-details "Booking" tab passes a raw marketplace
  // resource whose attributes may have no `schedules` key. This used to throw
  // "Cannot read properties of undefined (reading 'map')" and crash the page.
  it('renders the empty state when a booking resource has no schedules', () => {
    const resource = makeResource({ attributes: {} as any });

    expect(() =>
      render(<BookingResourcesCalendar bookingResources={[resource]} />),
    ).not.toThrow();

    expect(screen.getByText('Select a date')).toBeInTheDocument();
    expect(flatpickrSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({ enable: [] }),
      }),
    );
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

  it('computes enabled ranges from resources that have schedules', () => {
    const resource = makeResource({
      attributes: {
        schedules: [
          { start: '2025-01-10T09:00:00Z', end: '2025-01-10T11:00:00Z' },
          { start: '2025-02-03T08:00:00Z', end: '2025-02-04T18:00:00Z' },
        ],
      },
    });

    render(<BookingResourcesCalendar bookingResources={[resource]} />);

    const props = flatpickrSpy.mock.calls.at(-1)![0];
    expect(props.options.enable).toEqual([
      { from: '2025-01-10', to: '2025-01-10' },
      { from: '2025-02-03', to: '2025-02-04' },
    ]);
  });

  it('ignores resources without schedules while keeping those that have them', () => {
    const withSchedules = makeResource({
      uuid: 'with',
      attributes: {
        schedules: [
          { start: '2025-03-01T09:00:00Z', end: '2025-03-01T10:00:00Z' },
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

    const props = flatpickrSpy.mock.calls.at(-1)![0];
    expect(props.options.enable).toEqual([
      { from: '2025-03-01', to: '2025-03-01' },
    ]);
  });
});
