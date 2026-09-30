import type { Meta, StoryObj } from '@storybook/react-vite';
import { DateTime } from 'luxon';
import { expect, waitFor, within } from 'storybook/test';

import {
  isDayDisabled,
  pickDay,
  visibleCalendars,
  visibleMonths,
} from '@/form/datePickerStoryHarness';
import { withTableProviders } from '@/table/storyProviders';

import { BookingResource } from '../types';

import { BookingResourcesCalendar } from './BookingResourcesCalendar';

/**
 * `BookingResourcesCalendar` — the offering's "Bookings" tab: an inline
 * two-month calendar where only days with a booking are selectable, and
 * picking one lists that day's bookings on a timeline.
 *
 * Built on waldur-ui's date pickers, whose behaviour is specified under
 * `Forms/Date & time`; these stories cover this screen's own logic.
 */
const meta: Meta<typeof BookingResourcesCalendar> = {
  title: 'Booking/BookingResourcesCalendar',
  component: BookingResourcesCalendar,
  parameters: { layout: 'padded' },
  decorators: [withTableProviders],
};
export default meta;

type Story = StoryObj<typeof BookingResourcesCalendar>;

const thisMonth = DateTime.now().startOf('month');
const bookedDay = thisMonth.set({ day: 10 });
const bookedSpanStart = thisMonth.plus({ months: 1 }).set({ day: 5 });

const at = (day: DateTime, hour: number) =>
  day.set({ hour }).toFormat("yyyy-MM-dd'T'HH:mm:ss");

const resources: BookingResource[] = [
  {
    uuid: 'r1',
    name: 'GPU node',
    state: 'OK',
    customer_name: 'Alpha Lab',
    customer_uuid: 'c1',
    project_name: 'Protein folding',
    attributes: {
      schedules: [
        { id: 's1', start: at(bookedDay, 9), end: at(bookedDay, 12) },
      ],
    },
  } as any,
  {
    uuid: 'r2',
    name: 'Clean room',
    state: 'Creating',
    customer_name: 'Beta Institute',
    customer_uuid: 'c2',
    project_name: 'Wafer tests',
    attributes: {
      schedules: [
        {
          id: 's2',
          start: at(bookedSpanStart, 8),
          end: at(bookedSpanStart.plus({ days: 2 }), 18),
        },
      ],
    },
  } as any,
];

export const Default: Story = {
  args: { bookingResources: resources },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText('Select a date'),
    ).toBeInTheDocument();
    const months = visibleCalendars().flatMap((c) => visibleMonths(c));
    await expect(months).toEqual([
      thisMonth.toFormat('yyyy-MM'),
      thisMonth.plus({ months: 1 }).toFormat('yyyy-MM'),
    ]);
  },
};

/** Only days covered by a booking (including every day of a span) are enabled. */
export const OnlyBookedDaysEnabled: Story = {
  args: { bookingResources: resources },
  play: async () => {
    await expect(await isDayDisabled(bookedDay)).toBe(false);
    await expect(await isDayDisabled(bookedDay.plus({ days: 1 }))).toBe(true);
    await expect(await isDayDisabled(bookedSpanStart.plus({ days: 1 }))).toBe(
      false,
    );
    await expect(await isDayDisabled(bookedSpanStart.plus({ days: 3 }))).toBe(
      true,
    );
  },
};

export const PickBookedDay: Story = {
  args: { bookingResources: resources },
  play: async ({ canvasElement }) => {
    await pickDay(bookedDay);
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(
        canvas.getByText(bookedDay.toFormat('dd LLLL yyyy')),
      ).toBeInTheDocument(),
    );
    await expect(canvas.getByText('Alpha Lab')).toBeInTheDocument();
    await expect(canvas.queryByText('Beta Institute')).toBeNull();
  },
};

/** A day in the middle of a multi-day booking lists it too. */
export const PickDayInsideSpan: Story = {
  args: { bookingResources: resources },
  play: async ({ canvasElement }) => {
    await pickDay(bookedSpanStart.plus({ days: 1 }));
    await waitFor(() =>
      expect(
        within(canvasElement).getByText('Beta Institute'),
      ).toBeInTheDocument(),
    );
  },
};

export const NoBookings: Story = {
  args: { bookingResources: [] },
  play: async () => {
    await expect(await isDayDisabled(bookedDay)).toBe(true);
  },
};
