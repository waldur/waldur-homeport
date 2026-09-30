import type { Meta, StoryObj } from '@storybook/react-vite';
import { DateTime } from 'luxon';
import { ComponentProps, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { DatePicker } from './DatePicker';
import {
  Field,
  ValueReadout,
  closePicker,
  daysFromToday,
  displayValue,
  ensureOpen,
  fieldContainer,
  firstWeekday,
  getTrigger,
  hasTimeInput,
  isCalendarOpen,
  isDayDisabled,
  isTimeDisabled,
  isTriggerDisabled,
  openPicker,
  pickDay,
  placeholderText,
  readFormValue,
  selectedDays,
  setTime,
  visibleMonths,
} from './testing';

/**
 * `DatePicker` — a single date, optionally with a time of day, in a popup
 * Calendar (or inline). Plain `Date` in and out.
 *
 * These stories are its behavioural contract: each `play` drives the
 * picker through the shared driver (`./testing`) and asserts only on what a
 * user sees or what `onChange`/`onClose` report. The app's form adapters
 * are covered by `Forms/Date & time/Form fields`, for what they add only.
 *
 * Callers pass `minDate`/`maxDate` in various shapes — ISO
 * dates, full ISO datetimes, `Date`s and the keyword `'today'` — so each
 * shape has a story. Bounds are day-granular and inclusive in the calendar;
 * with a time, the picked moment is also clamped to them. For the dark
 * theme, use the toolbar's theme switch.
 */
const meta: Meta<typeof DatePicker> = {
  title: 'Forms/Date & time/DatePicker',
  component: DatePicker,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof DatePicker>;

/** Controlled picker that prints its value and how often it closed. */
const Harness = ({
  initial = null,
  ...props
}: Partial<ComponentProps<typeof DatePicker>> & { initial?: Date | null }) => {
  const [value, setValue] = useState<Date | null>(initial);
  const [closed, setClosed] = useState(0);
  return (
    <>
      <Field>
        <DatePicker
          value={value}
          onChange={setValue}
          onClose={() => setClosed((n) => n + 1)}
          {...props}
        />
      </Field>
      <ValueReadout value={value} />
      <ValueReadout label="Closed" value={closed} testId="closed-count" />
    </>
  );
};

const june15 = new Date(2026, 5, 15);
const june15at0830 = new Date(2026, 5, 15, 8, 30);

// ── Picking ─────────────────────────────────────────────

/**
 * Empty, it shows the placeholder; it opens on the current month, and a
 * pick is stored at midnight, shown, and closes the popup.
 */
export const PickADay: Story = {
  render: () => <Harness placeholder="Select a date" />,
  play: async ({ canvasElement }) => {
    const field = fieldContainer(canvasElement);
    await expect(displayValue(field)).toBe('');
    await expect(placeholderText(field)).toBe('Select a date');
    await openPicker(field);
    await expect(visibleMonths()).toEqual([DateTime.now().toFormat('yyyy-MM')]);
    const day = DateTime.now().set({ day: 15 }).toISODate();
    await pickDay(day);
    await waitFor(() =>
      expect(readFormValue(canvasElement)).toBe(`${day}T00:00`),
    );
    await expect(displayValue(field)).toBe(day);
    await waitFor(() => expect(isCalendarOpen()).toBe(false));
  },
};

/**
 * A value is shown formatted and opens the calendar on its month, weeks
 * starting on Monday; paging to another month and picking replaces it.
 */
export const WithValue: Story = {
  render: () => <Harness initial={june15} />,
  play: async ({ canvasElement }) => {
    const field = fieldContainer(canvasElement);
    await expect(displayValue(field)).toBe('2026-06-15');
    await openPicker(field);
    await expect(visibleMonths()).toEqual(['2026-06']);
    await expect(selectedDays()).toEqual(['2026-06-15']);
    await expect(firstWeekday()).toBe('mo');
    await pickDay('2026-08-03');
    await waitFor(() =>
      expect(readFormValue(canvasElement)).toBe('2026-08-03T00:00'),
    );
  },
};

/**
 * The remove button empties both the value and what is on screen — a
 * regression once left the old date visible after clearing.
 */
export const Clear: Story = {
  render: () => <Harness initial={june15} />,
  play: async ({ canvasElement }) => {
    const field = fieldContainer(canvasElement);
    await userEvent.click(
      within(field).getByRole('button', { name: 'Remove' }),
    );
    await waitFor(() => expect(readFormValue(canvasElement)).toBeNull());
    await expect(displayValue(field)).toBe('');
    await expect(
      within(field).queryByRole('button', { name: 'Remove' }),
    ).toBeNull();
  },
};

export const NotClearable: Story = {
  render: () => <Harness initial={june15} clearable={false} />,
  play: async ({ canvasElement }) => {
    await expect(
      within(fieldContainer(canvasElement)).queryByRole('button', {
        name: 'Remove',
      }),
    ).toBeNull();
  },
};

/** Closing the popup without picking keeps the value and reports onClose. */
export const DismissWithoutPicking: Story = {
  render: () => <Harness initial={june15} />,
  play: async ({ canvasElement }) => {
    await openPicker(fieldContainer(canvasElement));
    await closePicker();
    await expect(readFormValue(canvasElement)).toBe('2026-06-15T00:00');
    await waitFor(() =>
      expect(readFormValue(canvasElement, 'closed-count')).toBe(1),
    );
  },
};

// ── Bounds and availability ─────────────────────────────

/** ISO-date bounds: inclusive on both ends; out-of-range clicks do nothing. */
export const MinAndMaxDates: Story = {
  render: () => (
    <Harness initial={june15} minDate="2026-06-10" maxDate="2026-06-20" />
  ),
  play: async ({ canvasElement }) => {
    await openPicker(fieldContainer(canvasElement));
    await expect(await isDayDisabled('2026-06-09')).toBe(true);
    await expect(await isDayDisabled('2026-06-10')).toBe(false);
    await expect(await isDayDisabled('2026-06-20')).toBe(false);
    await expect(await isDayDisabled('2026-06-21')).toBe(true);
    await pickDay('2026-06-21');
    await expect(readFormValue(canvasElement)).toBe('2026-06-15T00:00');
  },
};

/** A full ISO datetime bound (the commonest caller shape) enables its day. */
export const MinDateAsIsoDateTime: Story = {
  render: () => (
    <Harness initial={june15} minDate="2026-06-10T17:45:00.000+03:00" />
  ),
  play: async ({ canvasElement }) => {
    await openPicker(fieldContainer(canvasElement));
    await expect(await isDayDisabled('2026-06-09')).toBe(true);
    await expect(await isDayDisabled('2026-06-10')).toBe(false);
    await expect(await isDayDisabled('2026-06-11')).toBe(false);
  },
};

export const MinDateAsDate: Story = {
  render: () => (
    <Harness initial={june15} minDate={new Date(2026, 5, 10, 17, 45)} />
  ),
  play: MinDateAsIsoDateTime.play,
};

/** `minDate="today"` — the keyword bound some callers pass. */
export const MinDateToday: Story = {
  render: () => <Harness minDate="today" />,
  play: async ({ canvasElement }) => {
    await openPicker(fieldContainer(canvasElement));
    await expect(await isDayDisabled(daysFromToday(-1))).toBe(true);
    await expect(await isDayDisabled(daysFromToday(0))).toBe(false);
    await expect(await isDayDisabled(daysFromToday(1))).toBe(false);
  },
};

/**
 * `enable` — predicates a day must satisfy (CreditEndDateField: credits end
 * on the first of a month). Combines with `minDate`.
 */
export const EnableOnlyFirstOfMonth: Story = {
  render: () => (
    <Harness
      initial={new Date(2026, 5, 1)}
      minDate="2026-06-01"
      enable={[(date: Date) => date.getDate() === 1]}
    />
  ),
  play: async ({ canvasElement }) => {
    await openPicker(fieldContainer(canvasElement));
    await expect(await isDayDisabled('2026-06-02')).toBe(true);
    await expect(await isDayDisabled('2026-07-01')).toBe(false);
    await pickDay('2026-07-01');
    await waitFor(() =>
      expect(readFormValue(canvasElement)).toBe('2026-07-01T00:00'),
    );
  },
};

// ── Presentation ────────────────────────────────────────

/** `inline` — the calendar is always on screen (a generated table filter). */
export const Inline: Story = {
  render: () => <Harness initial={june15} inline />,
  play: async ({ canvasElement }) => {
    await expect(visibleMonths()).toEqual(['2026-06']);
    await expect(selectedDays()).toEqual(['2026-06-15']);
    await pickDay('2026-06-20');
    await waitFor(() =>
      expect(readFormValue(canvasElement)).toBe('2026-06-20T00:00'),
    );
    await expect(selectedDays()).toEqual(['2026-06-20']);
  },
};

export const Disabled: Story = {
  render: () => <Harness initial={june15} disabled />,
  play: async ({ canvasElement }) => {
    const field = fieldContainer(canvasElement);
    await expect(isTriggerDisabled(field)).toBe(true);
    await expect(displayValue(field)).toBe('2026-06-15');
    await expect(
      within(field).queryByRole('button', { name: 'Remove' }),
    ).toBeNull();
    await userEvent.click(getTrigger(field), { pointerEventsCheck: 0 });
    await expect(isCalendarOpen()).toBe(false);
  },
};

/** `autoOpen` — the popup opens by itself on mount (table date filters). */
export const AutoOpen: Story = {
  render: () => <Harness initial={june15} autoOpen />,
  play: async () => {
    await waitFor(() => expect(isCalendarOpen()).toBe(true));
  },
};

/** The trigger's looks: default, `size="sm"` (with time) and `solid`. */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-[12px]" style={{ width: 320 }}>
      <DatePicker value={june15} onChange={() => undefined} />
      <DatePicker
        value={june15at0830}
        onChange={() => undefined}
        enableTime
        size="sm"
      />
      <DatePicker value={june15} onChange={() => undefined} solid />
    </div>
  ),
};

// ── With a time of day ──────────────────────────────────

/**
 * With `enableTime` the popup has a time row; a day picked without touching
 * the time gets 12:00, and the popup stays open so the time can be set.
 */
export const PickADayWithTime: Story = {
  render: () => <Harness enableTime placeholder="Pick date and time" />,
  play: async ({ canvasElement }) => {
    const field = fieldContainer(canvasElement);
    await openPicker(field);
    await expect(hasTimeInput()).toBe(true);
    await expect(isTimeDisabled()).toBe(true);
    await pickDay('2026-06-15');
    await waitFor(() =>
      expect(readFormValue(canvasElement)).toBe('2026-06-15T12:00'),
    );
    await expect(displayValue(field)).toBe('2026-06-15 12:00');
    await expect(isTimeDisabled()).toBe(false);
    await expect(isCalendarOpen()).toBe(true);
  },
};

export const PickDayAndTime: Story = {
  render: () => <Harness enableTime />,
  play: async ({ canvasElement }) => {
    const field = fieldContainer(canvasElement);
    await openPicker(field);
    await pickDay('2026-06-15');
    await ensureOpen(field);
    await setTime(8, 30);
    await waitFor(() =>
      expect(readFormValue(canvasElement)).toBe('2026-06-15T08:30'),
    );
    await expect(displayValue(field)).toBe('2026-06-15 08:30');
    await setTime(18, 5);
    await waitFor(() =>
      expect(readFormValue(canvasElement)).toBe('2026-06-15T18:05'),
    );
  },
};

/** A timed value is shown with its time, which survives picking another day. */
export const ChangeDayKeepsTime: Story = {
  render: () => <Harness initial={june15at0830} enableTime />,
  play: async ({ canvasElement }) => {
    const field = fieldContainer(canvasElement);
    await expect(displayValue(field)).toBe('2026-06-15 08:30');
    await openPicker(field);
    await pickDay('2026-06-20');
    await waitFor(() =>
      expect(readFormValue(canvasElement)).toBe('2026-06-20T08:30'),
    );
  },
};

/**
 * A datetime `minDate` (MaintenanceExtendDialog passes the current end):
 * the day before is disabled, the bound's own day is not, and a pick on
 * that day never lands before the bound.
 */
export const MinDateTimeClampsTheTime: Story = {
  render: () => <Harness enableTime minDate={new Date(2026, 5, 15, 14, 0)} />,
  play: async ({ canvasElement }) => {
    await openPicker(fieldContainer(canvasElement));
    await expect(await isDayDisabled('2026-06-14')).toBe(true);
    await expect(await isDayDisabled('2026-06-15')).toBe(false);
    await pickDay('2026-06-15');
    await waitFor(() =>
      expect(readFormValue(canvasElement)).toBe('2026-06-15T14:00'),
    );
  },
};
