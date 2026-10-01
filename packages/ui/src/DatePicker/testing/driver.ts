import { DateTime } from 'luxon';
import { userEvent, waitFor } from 'storybook/test';

/**
 * Story-only driver for the date pickers (Calendar, DatePicker,
 * DateRangePicker) and every screen built on them.
 *
 * The date-picker stories describe behaviour — what gets emitted, what is
 * shown, which days are selectable — and never touch picker DOM directly.
 * Everything that depends on the markup of `waldur-ui`'s `Calendar`
 * (react-day-picker, root marked `data-slot="calendar"`) and of the popup
 * trigger lives here, so a markup change is fixed in one place.
 *
 * Popup calendars are portalled to <body>, so lookups are document-wide
 * rather than scoped to the story canvas. Stories render one control at a
 * time (or pass an explicit container) to keep that unambiguous.
 */

type DateLike = Date | DateTime | string;

const toDateTime = (value: DateLike): DateTime =>
  value instanceof DateTime
    ? value
    : value instanceof Date
      ? DateTime.fromJSDate(value)
      : DateTime.fromISO(value);

const isoDay = (value: DateLike) => toDateTime(value).toISODate();
const isoMonth = (value: DateLike) => toDateTime(value).toFormat('yyyy-MM');

/** Every calendar currently on screen, in document order. */
export const visibleCalendars = (): HTMLElement[] =>
  Array.from(document.querySelectorAll<HTMLElement>('[data-slot="calendar"]'));

const getCalendar = (index = 0): HTMLElement => {
  const calendars = visibleCalendars();
  const calendar = calendars[index];
  if (!calendar) {
    throw new Error(
      `Expected calendar #${index}, found ${calendars.length} on screen`,
    );
  }
  return calendar;
};

/** A popup (as opposed to inline) calendar: closes when dismissed. */
const isPopup = (calendar: HTMLElement) =>
  !!calendar.closest('[data-radix-popper-content-wrapper]');

export const isCalendarOpen = () =>
  [
    ...visibleCalendars(),
    ...document.querySelectorAll<HTMLElement>('[data-slot="month-calendar"]'),
  ].some(isPopup);

interface DayCell {
  el: HTMLElement;
  iso: string;
  outside: boolean;
  disabled: boolean;
  selected: boolean;
}

const readDays = (calendar: HTMLElement): DayCell[] =>
  Array.from(calendar.querySelectorAll<HTMLElement>('[data-day]')).map(
    (cell) => ({
      el: cell.querySelector<HTMLElement>('button') ?? cell,
      iso: cell.dataset.day,
      outside: cell.dataset.outside === 'true',
      disabled: cell.dataset.disabled === 'true',
      selected: cell.dataset.selected === 'true',
    }),
  );

/** `yyyy-MM` of every month the calendar is currently showing. */
export const visibleMonths = (calendar = getCalendar()): string[] =>
  Array.from(
    new Set(
      readDays(calendar)
        .filter((d) => !d.outside)
        .map((d) => d.iso.slice(0, 7)),
    ),
  ).sort();

const findDay = (calendar: HTMLElement, date: DateLike) => {
  const iso = isoDay(date);
  return readDays(calendar).find((d) => d.iso === iso && !d.outside);
};

const navButton = (calendar: HTMLElement, direction: 'next' | 'prev') =>
  calendar.querySelector<HTMLButtonElement>(
    direction === 'next' ? '.rdp-button_next' : '.rdp-button_previous',
  );

/** Whether the calendar refuses to page further in `direction`. */
export const isNavDisabled = (
  direction: 'next' | 'prev',
  calendar = getCalendar(),
) => {
  const button = navButton(calendar, direction);
  return (
    !button ||
    button.disabled ||
    button.getAttribute('aria-disabled') === 'true'
  );
};

/**
 * Pages the calendar with its own prev/next buttons until `date` is shown.
 * Resolves `false` when the calendar refuses to page that far, as it does
 * past `minDate`/`maxDate`.
 */
const goToMonth = async (date: DateLike, calendar = getCalendar()) => {
  const target = isoMonth(date);
  for (let step = 0; step < 60; step++) {
    const months = visibleMonths(calendar);
    if (months.includes(target)) return true;
    const direction = target < months[0] ? 'prev' : 'next';
    if (isNavDisabled(direction, calendar)) {
      return;
    }
    const button = navButton(calendar, direction);
    if (!button) throw new Error(`No ${direction} month button`);
    if (isNavDisabled(direction, calendar)) return false;
    await userEvent.click(button);
    await waitFor(() => {
      if (visibleMonths(calendar)[0] === months[0]) {
        throw new Error('Month did not change');
      }
    });
  }
  throw new Error(`Could not navigate to ${target}`);
};

export const isDayDisabled = async (
  date: DateLike,
  calendar = getCalendar(),
) => {
  // A day in a month the calendar will not page to cannot be picked.
  if (!(await goToMonth(date, calendar))) return true;
  const day = findDay(calendar, date);
  if (!day) throw new Error(`Day ${isoDay(date)} is not rendered`);
  return day.disabled;
};

/** ISO dates (`yyyy-MM-dd`) the calendar marks as selected, ranges included. */
export const selectedDays = (calendar = getCalendar()) =>
  readDays(calendar)
    .filter((d) => d.selected && !d.outside)
    .map((d) => d.iso);

export const pickDay = async (date: DateLike, calendar = getCalendar()) => {
  if (!(await goToMonth(date, calendar))) {
    throw new Error(`Cannot navigate to ${isoMonth(date)}`);
  }
  const day = findDay(calendar, date);
  if (!day) throw new Error(`Day ${isoDay(date)} is not rendered`);
  // Disabled days are still clickable by a user; they just do nothing.
  await userEvent.click(day.el, { pointerEventsCheck: 0 });
};

/**
 * Sets a time input in the open popup: "Time" on a single-date picker,
 * "Start time"/"End time" (`which`) on the range picker.
 */
export const setTime = async (
  hour: number,
  minute: number,
  { which }: { which?: 'start' | 'end' } = {},
) => {
  const label =
    which === 'start' ? 'Start time' : which === 'end' ? 'End time' : 'Time';
  const group = document.querySelector<HTMLElement>(
    `[role="group"][aria-label="${label}"]`,
  );
  if (!group) throw new Error(`No "${label}" time input`);
  const [hourInput, minuteInput] = Array.from(group.querySelectorAll('input'));
  // Each field is a draft until Enter (or blur) commits it.
  await userEvent.clear(hourInput);
  await userEvent.type(hourInput, `${hour}{Enter}`);
  await userEvent.clear(minuteInput);
  await userEvent.type(minuteInput, `${minute}{Enter}`);
};

/** Whether the open popup offers any time input. */
export const hasTimeInput = () =>
  !!document.querySelector(
    ['Time', 'Start time', 'End time']
      .map((label) => `[role="group"][aria-label="${label}"]`)
      .join(', '),
  );

/** Whether the popup's time inputs are disabled. */
export const isTimeDisabled = ({ which }: { which?: 'start' | 'end' } = {}) => {
  const label =
    which === 'start' ? 'Start time' : which === 'end' ? 'End time' : 'Time';
  const group = document.querySelector<HTMLElement>(
    `[role="group"][aria-label="${label}"]`,
  );
  if (!group) throw new Error(`No "${label}" time input`);
  const inputs = Array.from(group.querySelectorAll<HTMLInputElement>('input'));
  return inputs.length > 0 && inputs.every((input) => input.disabled);
};

/** Two-letter, lower-case name of the first weekday column (`mo`, `su`). */
export const firstWeekday = (calendar = getCalendar()) => {
  const header = calendar.querySelector<HTMLElement>('.rdp-weekday');
  const name = header?.getAttribute('aria-label') || header?.textContent || '';
  return name.trim().slice(0, 2).toLowerCase();
};

const TRIGGER = '[data-slot="date-picker-trigger"]';

/** The buttons that open popup pickers, in document order. */
export const getTriggers = (container: HTMLElement): HTMLElement[] =>
  Array.from(container.querySelectorAll<HTMLElement>(TRIGGER));

export const getTrigger = (container: HTMLElement): HTMLElement => {
  const trigger = getTriggers(container)[0];
  if (!trigger) throw new Error('No date picker trigger in container');
  return trigger;
};

/** The formatted value the trigger shows, `''` when empty. */
export const displayValue = (
  container: HTMLElement,
  trigger = getTrigger(container),
) =>
  trigger.querySelector('[data-slot="date-picker-value"]')?.textContent ?? '';

/** Placeholder the empty trigger shows. */
export const placeholderText = (
  container: HTMLElement,
  trigger = getTrigger(container),
) =>
  trigger.querySelector('[data-slot="date-picker-placeholder"]')?.textContent ??
  '';

export const isTriggerDisabled = (container: HTMLElement) =>
  (getTrigger(container) as HTMLButtonElement).disabled;

export const openPicker = async (
  container: HTMLElement,
  trigger = getTrigger(container),
) => {
  await userEvent.click(trigger);
  await waitFor(() => {
    if (!isCalendarOpen()) throw new Error('Calendar did not open');
  });
};

/** Opens the popup unless it already is. */
export const ensureOpen = async (container: HTMLElement) => {
  if (!isCalendarOpen()) await openPicker(container);
};

/** Dismisses the open popup the way a user would: a click outside it. */
export const closePicker = async () => {
  await userEvent.click(document.body);
  await waitFor(() => {
    if (isCalendarOpen()) throw new Error('Calendar did not close');
  });
};

// ── MonthPicker ─────────────────────────────────────────

const monthCalendar = () => {
  const grid = document.querySelector<HTMLElement>(
    '[data-slot="month-calendar"]',
  );
  if (!grid) throw new Error('No month grid on screen');
  return grid;
};

/** The year the open month grid shows. */
export const shownYear = () =>
  Number(
    monthCalendar().querySelector('[data-slot="month-calendar-year"]')
      .textContent,
  );

/** Pages the month grid with its arrows until `yyyy-MM`'s year is shown. */
const goToYear = async (month: string) => {
  const target = Number(month.slice(0, 4));
  for (let step = 0; step < 200 && shownYear() !== target; step++) {
    const label = target < shownYear() ? 'Previous year' : 'Next year';
    const button = monthCalendar().querySelector<HTMLButtonElement>(
      `button[aria-label="${label}"]`,
    );
    if (!button || button.disabled) throw new Error(`Cannot page to ${target}`);
    await userEvent.click(button);
  }
};

const monthButton = (month: string) => {
  const button = monthCalendar().querySelector<HTMLButtonElement>(
    `[data-month="${month}"]`,
  );
  if (!button) throw new Error(`Month ${month} is not shown`);
  return button;
};

/** Picks a month (`yyyy-MM`) in the open month grid. */
export const pickMonth = async (month: string) => {
  await goToYear(month);
  await userEvent.click(monthButton(month), { pointerEventsCheck: 0 });
};

export const isMonthDisabled = async (month: string) => {
  await goToYear(month);
  return monthButton(month).disabled;
};

/** The selected month (`yyyy-MM`) in the open month grid, if shown. */
export const selectedMonth = () =>
  monthCalendar().querySelector<HTMLElement>('[data-month][data-selected]')
    ?.dataset.month ?? null;

/** Whether the open month grid refuses to page further in `direction`. */
export const isYearNavDisabled = (direction: 'next' | 'prev') =>
  !!monthCalendar().querySelector<HTMLButtonElement>(
    `button[aria-label="${direction === 'next' ? 'Next year' : 'Previous year'}"]`,
  )?.disabled;
