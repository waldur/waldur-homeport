import type { Meta, StoryObj } from '@storybook/react-vite';
import { DateTime } from 'luxon';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  isDayDisabled,
  pickDay,
  visibleCalendars,
  visibleMonths,
} from '@/form/datePickerStoryHarness';
import {
  DateFieldHarness,
  daysFromToday,
  readFormValue,
} from '@/form/datePickerStoryHarness';

import { CustomRangeDatePicker } from './CustomRangeDatePicker';

/**
 * `CustomRangeDatePicker` — the booking-period picker: an always-visible
 * "From date" / "End date" pair of months with optional start/end time lists.
 * Used by the booking order form (with `enable` availability windows and
 * the time lists) and by the offering scheduler (with a `disable` function
 * for weekends/weekdays). Stores `[Date, Date]`.
 *
 * Times: without availability windows a picked range spans the whole days
 * (00:00 → 23:59:59); with them, the first/last available time of each day.
 *
 * Built on waldur-ui's date pickers, whose behaviour is specified under
 * `Forms/Date & time`; these stories cover this screen's own logic.
 */
const meta: Meta<typeof CustomRangeDatePicker> = {
  title: 'Booking/CustomRangeDatePicker',
  component: CustomRangeDatePicker,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof CustomRangeDatePicker>;

const thisMonth = DateTime.now().startOf('month');
const dayA = thisMonth.set({ day: 10 });
const dayB = thisMonth.set({ day: 12 });
const iso = (d: DateTime) => d.toISODate();

const render =
  (options: Record<string, unknown> = {}, initialValue: unknown = []) =>
  () => (
    <DateFieldHarness
      component={CustomRangeDatePicker}
      width={760}
      initialValue={initialValue}
      fieldProps={{ options }}
    />
  );

export const Default: Story = {
  render: render(),
  play: async () => {
    const months = visibleCalendars().flatMap((c) => visibleMonths(c));
    await expect(months).toEqual([
      thisMonth.toFormat('yyyy-MM'),
      thisMonth.plus({ months: 1 }).toFormat('yyyy-MM'),
    ]);
  },
};

export const PickRangeWholeDays: Story = {
  render: render(),
  play: async ({ canvasElement }) => {
    await pickDay(dayA);
    await pickDay(dayB);
    await waitFor(() =>
      expect(readFormValue(canvasElement)).toEqual([
        `${iso(dayA)}T00:00`,
        `${iso(dayB)}T23:59:59`,
      ]),
    );
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText(dayA.toLocaleString(DateTime.DATE_FULL)),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText(dayB.toLocaleString(DateTime.DATE_FULL)),
    ).toBeInTheDocument();
  },
};

/** `minDate: 'today'`, as both callers pass it. */
export const MinDateToday: Story = {
  render: render({ minDate: 'today' }),
  play: async () => {
    await expect(await isDayDisabled(daysFromToday(-1))).toBe(true);
    await expect(await isDayDisabled(daysFromToday(0))).toBe(false);
  },
};

/** The scheduler's `disable` function (here: weekends). */
export const DisableWeekends: Story = {
  render: render({
    disable: [(date: Date) => date.getDay() === 0 || date.getDay() === 6],
  }),
  play: async () => {
    const saturday = thisMonth.plus({ days: (6 - thisMonth.weekday + 7) % 7 });
    await expect(await isDayDisabled(saturday)).toBe(true);
    await expect(await isDayDisabled(saturday.minus({ days: 1 }))).toBe(false);
  },
};

/**
 * Booking form: availability windows (ISO datetimes, as
 * `getAvailableRangeOfDates` builds them) plus the start/end time lists.
 */
const availability = [
  {
    from: dayA.set({ hour: 9 }).toISO(),
    to: dayB.set({ hour: 17 }).toISO(),
  },
];

export const WithAvailabilityAndTimes: Story = {
  render: render({
    enable: availability,
    hasTimePicker: true,
    timeStep: 60,
  }),
  play: async ({ canvasElement }) => {
    await expect(await isDayDisabled(dayA.minus({ days: 1 }))).toBe(true);
    await expect(await isDayDisabled(dayB.plus({ days: 1 }))).toBe(true);
    await pickDay(dayA);
    await pickDay(dayB);
    await waitFor(() =>
      expect(readFormValue(canvasElement)).toEqual([
        `${iso(dayA)}T09:00`,
        `${iso(dayB)}T17:00`,
      ]),
    );

    const canvas = within(canvasElement);
    const startList = canvas
      .getByText('Start time')
      .closest('div').parentElement;
    const endList = canvas.getByText('End time').closest('div').parentElement;
    // Outside the availability window.
    const early = within(startList).getByRole('button', { name: '08:00' });
    await expect(
      (early as HTMLButtonElement).disabled ||
        early.getAttribute('aria-disabled') === 'true',
    ).toBe(true);
    await userEvent.click(
      within(startList).getByRole('button', { name: '10:00' }),
    );
    await userEvent.click(
      within(endList).getByRole('button', { name: '15:00' }),
    );
    await waitFor(() =>
      expect(readFormValue(canvasElement)).toEqual([
        `${iso(dayA)}T10:00`,
        `${iso(dayB)}T15:00`,
      ]),
    );
  },
};

/** Editing an existing period: both ends shown, calendars on its months. */
export const WithValue: Story = {
  render: render({}, [
    dayA.set({ hour: 9 }).toJSDate(),
    dayB.set({ hour: 17 }).toJSDate(),
  ]),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText(dayA.toLocaleString(DateTime.DATE_FULL)),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText(dayB.toLocaleString(DateTime.DATE_FULL)),
    ).toBeInTheDocument();
    const months = visibleCalendars().flatMap((c) => visibleMonths(c));
    await expect(months).toContain(thisMonth.toFormat('yyyy-MM'));
  },
};
