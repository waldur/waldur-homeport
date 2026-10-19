import type { Meta, StoryObj } from '@storybook/react-vite';
import { DateTime } from 'luxon';
import { ComponentProps, ReactNode, useState } from 'react';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';

import { ModalDialog, ModalShell } from '../Dialog';

import { DatePicker } from './DatePicker';
import {
  Field,
  ValueReadout,
  closePicker,
  daysFromToday,
  displayValue,
  dropdownOptions,
  ensureOpen,
  entryErrors,
  fieldContainer,
  firstWeekday,
  formatHintText,
  isFormatHintVisible,
  getInputs,
  getTrigger,
  hasTimeInput,
  isCalendarOpen,
  isDayDisabled,
  isTimeDisabled,
  isTriggerDisabled,
  openPicker,
  pageMonth,
  pasteDate,
  pickDay,
  pickMonthAndYear,
  placeholderText,
  readFormValue,
  selectedDays,
  setTime,
  typeDate,
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
    await userEvent.click(within(field).getByRole('button', { name: 'Clear' }));
    await waitFor(() => expect(readFormValue(canvasElement)).toBeNull());
    await expect(displayValue(field)).toBe('');
    await expect(
      within(field).queryByRole('button', { name: 'Clear' }),
    ).toBeNull();
  },
};

export const NotClearable: Story = {
  render: () => <Harness initial={june15} clearable={false} />,
  play: async ({ canvasElement }) => {
    await expect(
      within(fieldContainer(canvasElement)).queryByRole('button', {
        name: 'Clear',
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

/**
 * `captionLayout="dropdown"` — month and year dropdowns in the caption for
 * dates far from today, such as a birth date. With `maxDate` the years end
 * at its year (later months are disabled); they start 100 years back.
 */
export const YearAndMonthDropdowns: Story = {
  render: () => (
    <Harness
      captionLayout="dropdown"
      maxDate="today"
      placeholder="Birth date"
    />
  ),
  play: async ({ canvasElement }) => {
    const field = fieldContainer(canvasElement);
    await openPicker(field);
    const now = DateTime.now();
    const years = await dropdownOptions('year');
    await expect(years.at(0).value).toBe(now.year - 100);
    await expect(years.at(-1).value).toBe(now.year);
    await expect(years.find((year) => year.selected).value).toBe(now.year);
    // Escape closes the option grid, not the calendar.
    await userEvent.keyboard('{Escape}');
    await expect(isCalendarOpen()).toBe(true);
    await pickMonthAndYear('1990-03');
    await pickDay('1990-03-21');
    await waitFor(() =>
      expect(readFormValue(canvasElement)).toBe('1990-03-21T00:00'),
    );
    await expect(displayValue(field)).toBe('1990-03-21');
  },
};

/**
 * The month arrows still page the calendar next to the caption dropdowns:
 * the dropdowns must not cover them.
 */
export const ArrowsBesideDropdowns: Story = {
  render: () => (
    <Harness
      captionLayout="dropdown"
      maxDate="today"
      placeholder="Birth date"
    />
  ),
  play: async ({ canvasElement }) => {
    const field = fieldContainer(canvasElement);
    await openPicker(field);
    const thisMonth = DateTime.now().toFormat('yyyy-MM');
    const lastMonth = DateTime.now().minus({ months: 1 }).toFormat('yyyy-MM');
    await expect(visibleMonths()).toEqual([thisMonth]);
    await pageMonth('prev');
    await expect(visibleMonths()).toEqual([lastMonth]);
    await pageMonth('next');
    await expect(visibleMonths()).toEqual([thisMonth]);
    // The dropdowns between the arrows still open.
    await expect((await dropdownOptions('month')).length).toBe(12);
  },
};

export const Disabled: Story = {
  render: () => <Harness initial={june15} disabled />,
  play: async ({ canvasElement }) => {
    const field = fieldContainer(canvasElement);
    await expect(isTriggerDisabled(field)).toBe(true);
    await expect(displayValue(field)).toBe('2026-06-15');
    await expect(
      within(field).queryByRole('button', { name: 'Clear' }),
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

// ── In a modal dialog ───────────────────────────────────

/** An open waldur-ui Modal around the picker, as the app's dialogs are. */
const InAModal = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(true);
  return (
    <ModalShell open={open} onHide={() => setOpen(false)} size="sm">
      <ModalDialog title="Set termination date">{children}</ModalDialog>
    </ModalShell>
  );
};

/**
 * In a modal dialog, opening the calendar puts focus on its selected day,
 * so the arrow keys move between days and Enter picks one. The dialog traps
 * focus, and its trap used to pull focus straight back to the trigger: the
 * calendar focused the day before its popup told the trap to stand aside.
 */
export const InAModalDialog: Story = {
  render: () => (
    <InAModal>
      <Harness initial={june15} />
    </InAModal>
  ),
  play: async () => {
    // The dialog is portaled out of the story's canvas.
    const field = fieldContainer(document.body);
    await openPicker(field);
    await waitFor(() =>
      expect(document.activeElement).toHaveAccessibleName(/June 15th, 2026/),
    );
    await userEvent.keyboard('{ArrowRight}');
    await expect(document.activeElement).toHaveAccessibleName(
      /June 16th, 2026/,
    );
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(readFormValue(document.body)).toBe('2026-06-16T00:00'),
    );
    await waitFor(() => expect(getTrigger(field)).toHaveFocus());
  },
};

// ── Typing ──────────────────────────────────────────────

/**
 * The input is the primary control: digits typed are laid out as
 * `yyyy-MM-dd` and committed on Enter, without the calendar ever opening.
 * Without a `placeholder` the empty input shows the format; screen readers
 * get it as the input's description either way.
 */
export const TypeADate: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const field = fieldContainer(canvasElement);
    const [input] = getInputs(field);
    await expect(input).toHaveAttribute('inputmode', 'numeric');
    // The format is the empty input's placeholder on screen, and is read
    // out with the input from a hint that is not shown.
    await expect(placeholderText(field)).toBe('YYYY-MM-DD');
    await expect(formatHintText(field)).toBe('Format: YYYY-MM-DD');
    await expect(isFormatHintVisible(field)).toBe(false);
    await expect(input).toHaveAccessibleDescription('Format: YYYY-MM-DD');
    await userEvent.type(input, '20260615');
    await expect(input).toHaveValue('2026-06-15');
    await expect(isCalendarOpen()).toBe(false);
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(readFormValue(canvasElement)).toBe('2026-06-15T00:00'),
    );
    await expect(isCalendarOpen()).toBe(false);
  },
};

/**
 * Leaving the input commits it too. Moving on to the field's own buttons is
 * not leaving the field; tabbing past them reports onClose (the blur).
 */
export const TypeAndTabAway: Story = {
  render: () => <Harness initial={june15} />,
  play: async ({ canvasElement }) => {
    const field = fieldContainer(canvasElement);
    await typeDate(field, '2026-07-01', { commit: 'tab' });
    await waitFor(() =>
      expect(readFormValue(canvasElement)).toBe('2026-07-01T00:00'),
    );
    await expect(readFormValue(canvasElement, 'closed-count')).toBe(0);
    await expect(getTrigger(field)).not.toHaveFocus();
    await userEvent.tab();
    await expect(getTrigger(field)).toHaveFocus();
    await userEvent.tab();
    await waitFor(() =>
      expect(readFormValue(canvasElement, 'closed-count')).toBe(1),
    );
  },
};

/** A pasted ISO datetime is reformatted to the field's format. */
export const PasteAnIsoDate: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const field = fieldContainer(canvasElement);
    await pasteDate(field, '2026-06-15T08:30:00.000+03:00');
    await expect(displayValue(field)).toBe('2026-06-15');
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(readFormValue(canvasElement)).toBe('2026-06-15T00:00'),
    );
  },
};

/**
 * Something that is not a date stays in the input, marked invalid and
 * described by a message; the value is emptied rather than left stale.
 * A valid entry clears the message.
 */
export const InvalidEntryIsReported: Story = {
  render: () => <Harness initial={june15} />,
  play: async ({ canvasElement }) => {
    const field = fieldContainer(canvasElement);
    const [input] = getInputs(field);
    await typeDate(field, '20261340');
    await expect(input).toHaveValue('2026-13-40');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(entryErrors(field)).toEqual(['Enter a date as YYYY-MM-DD.']);
    await expect(input).toHaveAccessibleDescription(
      'Enter a date as YYYY-MM-DD. Format: YYYY-MM-DD',
    );
    await waitFor(() => expect(readFormValue(canvasElement)).toBeNull());
    await typeDate(field, '20260616');
    await waitFor(() =>
      expect(readFormValue(canvasElement)).toBe('2026-06-16T00:00'),
    );
    await expect(input).not.toHaveAttribute('aria-invalid');
    await expect(entryErrors(field)).toEqual([]);
  },
};

/** Typed days follow the calendar's rules: bounds and `enable`, unclamped. */
export const OutOfRangeEntryIsReported: Story = {
  render: () => (
    <Harness
      minDate="2026-06-05"
      maxDate="2026-06-25"
      enable={[(date) => date.getDay() !== 0]}
    />
  ),
  play: async ({ canvasElement }) => {
    const field = fieldContainer(canvasElement);
    await typeDate(field, '20260601');
    await expect(displayValue(field)).toBe('2026-06-01');
    await expect(entryErrors(field)).toEqual([
      'Enter a date on or after 2026-06-05.',
    ]);
    await typeDate(field, '20260630');
    await expect(entryErrors(field)).toEqual([
      'Enter a date on or before 2026-06-25.',
    ]);
    // 2026-06-14 is a Sunday.
    await typeDate(field, '20260614');
    await expect(entryErrors(field)).toEqual(['This date is not available.']);
    await expect(readFormValue(canvasElement)).toBeNull();
    await typeDate(field, '20260615');
    await waitFor(() =>
      expect(readFormValue(canvasElement)).toBe('2026-06-15T00:00'),
    );
  },
};

/** Emptying the input and committing clears the value. */
export const TypeToClear: Story = {
  render: () => <Harness initial={june15} />,
  play: async ({ canvasElement }) => {
    await typeDate(fieldContainer(canvasElement), '');
    await waitFor(() => expect(readFormValue(canvasElement)).toBeNull());
  },
};

/**
 * With `enableTime` the input takes `yyyy-MM-dd HH:mm`; a bare date gets
 * the time a calendar pick would, and a typed time before a datetime
 * `minDate` is reported, not moved.
 */
export const TypeADateWithTime: Story = {
  render: () => <Harness enableTime minDate={new Date(2026, 5, 15, 14, 0)} />,
  play: async ({ canvasElement }) => {
    const field = fieldContainer(canvasElement);
    await expect(formatHintText(field)).toBe('Format: YYYY-MM-DD HH:MM');
    await typeDate(field, '202606201830');
    await expect(displayValue(field)).toBe('2026-06-20 18:30');
    await waitFor(() =>
      expect(readFormValue(canvasElement)).toBe('2026-06-20T18:30'),
    );
    await typeDate(field, '20260621');
    await waitFor(() =>
      expect(readFormValue(canvasElement)).toBe('2026-06-21T18:30'),
    );
    await expect(displayValue(field)).toBe('2026-06-21 18:30');
    await typeDate(field, '202606151300');
    await expect(entryErrors(field)).toEqual([
      'Enter a date on or after 2026-06-15 14:00.',
    ]);
    await expect(displayValue(field)).toBe('2026-06-15 13:00');
  },
};

/**
 * Keyboard only, in a modal dialog: Tab to the input, type, Enter commits
 * without closing anything; Tab to the calendar button, Enter opens the
 * calendar on the typed day, and Escape closes just the calendar, giving
 * focus back to its button.
 */
export const KeyboardOnlyInAModalDialog: Story = {
  render: () => (
    <InAModal>
      <label htmlFor="termination-date">Termination date</label>
      <Harness id="termination-date" />
    </InAModal>
  ),
  play: async () => {
    const field = fieldContainer(document.body);
    const [input] = getInputs(field);
    await expect(input).toHaveAccessibleName('Termination date');
    input.focus();
    await userEvent.keyboard('20260615{Enter}');
    await waitFor(() =>
      expect(readFormValue(document.body)).toBe('2026-06-15T00:00'),
    );
    await userEvent.tab();
    await userEvent.tab();
    await expect(getTrigger(field)).toHaveFocus();
    await expect(getTrigger(field)).toHaveAccessibleName('Choose date');
    await expect(getTrigger(field)).toHaveAttribute('aria-haspopup', 'dialog');
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(isCalendarOpen()).toBe(true));
    await expect(getTrigger(field)).toHaveAttribute('aria-expanded', 'true');
    await expect(
      document.querySelector('[role="dialog"][aria-label="Choose date"]'),
    ).not.toBeNull();
    await waitFor(() =>
      expect(document.activeElement).toHaveAccessibleName(/June 15th, 2026/),
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(isCalendarOpen()).toBe(false));
    await waitFor(() => expect(getTrigger(field)).toHaveFocus());
    // The modal is still open.
    await expect(screen.getByRole('dialog')).toBeInTheDocument();
  },
};
