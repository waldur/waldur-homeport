import type { Meta, StoryObj } from '@storybook/react-vite';
import { ComponentProps, useRef, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { BaseButton } from '../BaseButton';

import {
  DateRangePicker,
  DateRangePickerHandle,
  DateRangeValue,
} from './DateRangePicker';
import {
  Field,
  ValueReadout,
  closePicker,
  daysFromToday,
  displayValue,
  fieldContainer,
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
} from './testing';

/**
 * `DateRangePicker` — a start and end, optionally with times, in a popup
 * Calendar. Plain `[Date, Date]` in and out.
 *
 * These stories are its behavioural contract (written like DatePicker's).
 * Highlights:
 * - Nothing is committed until both ends are picked; the first click is
 *   only reported through `onPartialStartChange` (the maintenance window's
 *   "+N h from start" chips).
 * - Clicks are ordered, and the same day twice is a one-day range.
 * - Closing the popup reports `onClose`; a ref exposes `open()`.
 *
 * The app's adapters (DateTimeRangeField, RangeDateField) are covered by
 * `Forms/Date & time/Form fields`, for what they add only.
 */
const meta: Meta<typeof DateRangePicker> = {
  title: 'Forms/Date & time/DateRangePicker',
  component: DateRangePicker,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof DateRangePicker>;

/** Controlled picker printing its value, partial start and close count. */
const Harness = ({
  initial,
  ...props
}: Partial<ComponentProps<typeof DateRangePicker>> & {
  initial?: DateRangeValue;
}) => {
  const [value, setValue] = useState<DateRangeValue | undefined>(initial);
  const [partial, setPartial] = useState<Date | undefined>();
  const [closed, setClosed] = useState(0);
  return (
    <>
      <Field width={400}>
        <DateRangePicker
          value={value}
          onChange={setValue}
          onPartialStartChange={setPartial}
          onClose={() => setClosed((n) => n + 1)}
          placeholder="Select date range"
          {...props}
        />
      </Field>
      <ValueReadout value={value ?? null} />
      <ValueReadout
        label="Partial start"
        value={partial ?? null}
        testId="partial-start"
      />
      <ValueReadout label="Closed" value={closed} testId="closed-count" />
    </>
  );
};

const june = (day: number, hour = 0) => new Date(2026, 5, day, hour);
const partialOf = (canvasElement: HTMLElement) =>
  readFormValue(canvasElement, 'partial-start');

// ── Picking ─────────────────────────────────────────────

/**
 * Empty, it shows the placeholder, has no time row and no bounds. The first
 * click is reported as a partial start and commits nothing; the second
 * commits both ends (midnight when date-only), shows them and closes.
 */
export const PickRange: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const field = fieldContainer(canvasElement);
    await expect(displayValue(field)).toBe('');
    await expect(placeholderText(field)).toBe('Select date range');
    await openPicker(field);
    await expect(hasTimeInput()).toBe(false);
    await expect(await isDayDisabled(daysFromToday(-400))).toBe(false);

    await pickDay('2026-06-10');
    await waitFor(() =>
      expect(partialOf(canvasElement)).toBe('2026-06-10T00:00'),
    );
    await expect(readFormValue(canvasElement)).toBeNull();
    await expect(isCalendarOpen()).toBe(true);

    await pickDay('2026-06-12');
    await waitFor(() =>
      expect(readFormValue(canvasElement)).toEqual([
        '2026-06-10T00:00',
        '2026-06-12T00:00',
      ]),
    );
    await expect(partialOf(canvasElement)).toBeNull();
    await expect(displayValue(field)).toBe('2026-06-10 to 2026-06-12');
    await waitFor(() => expect(isCalendarOpen()).toBe(false));
  },
};

/** Picking the end first still gives start < end. */
export const PickEndFirst: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    await openPicker(fieldContainer(canvasElement));
    await pickDay('2026-06-12');
    await pickDay('2026-06-10');
    await waitFor(() =>
      expect(readFormValue(canvasElement)).toEqual([
        '2026-06-10T00:00',
        '2026-06-12T00:00',
      ]),
    );
  },
};

/** The same day twice is a valid one-day range. */
export const SingleDayRange: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    await openPicker(fieldContainer(canvasElement));
    await pickDay('2026-06-10');
    await pickDay('2026-06-10');
    await waitFor(() =>
      expect(readFormValue(canvasElement)).toEqual([
        '2026-06-10T00:00',
        '2026-06-10T00:00',
      ]),
    );
  },
};

/**
 * A range is shown and marked in the calendar (with no remove button unless
 * `clearable`); re-picking replaces it.
 */
export const ReplaceRange: Story = {
  render: () => <Harness initial={[june(10), june(18)]} />,
  play: async ({ canvasElement }) => {
    const field = fieldContainer(canvasElement);
    await expect(displayValue(field)).toBe('2026-06-10 to 2026-06-18');
    await expect(
      within(field).queryByRole('button', { name: 'Remove' }),
    ).toBeNull();
    await openPicker(field);
    await expect(selectedDays()).toEqual(
      expect.arrayContaining(['2026-06-10', '2026-06-18']),
    );
    await pickDay('2026-07-01');
    await pickDay('2026-07-31');
    await waitFor(() =>
      expect(readFormValue(canvasElement)).toEqual([
        '2026-07-01T00:00',
        '2026-07-31T00:00',
      ]),
    );
  },
};

export const Bounded: Story = {
  render: () => (
    <Harness
      initial={[june(10), june(12)]}
      minDate="2026-06-05"
      maxDate="2026-06-25"
    />
  ),
  play: async ({ canvasElement }) => {
    await openPicker(fieldContainer(canvasElement));
    await expect(await isDayDisabled('2026-06-04')).toBe(true);
    await expect(await isDayDisabled('2026-06-05')).toBe(false);
    await expect(await isDayDisabled('2026-06-25')).toBe(false);
    await expect(await isDayDisabled('2026-06-26')).toBe(true);
  },
};

export const Clearable: Story = {
  render: () => <Harness initial={[june(10), june(12)]} clearable />,
  play: async ({ canvasElement }) => {
    const field = fieldContainer(canvasElement);
    await userEvent.click(
      within(field).getByRole('button', { name: 'Remove' }),
    );
    await waitFor(() => expect(readFormValue(canvasElement)).toBeNull());
    await expect(displayValue(field)).toBe('');
  },
};

/** Closing the popup reports onClose (the fields' blur). */
export const CloseReportsOnClose: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    await openPicker(fieldContainer(canvasElement));
    await closePicker();
    await waitFor(() =>
      expect(readFormValue(canvasElement, 'closed-count')).toBe(1),
    );
  },
};

export const Disabled: Story = {
  render: () => <Harness disabled />,
  play: async ({ canvasElement }) => {
    await expect(isTriggerDisabled(fieldContainer(canvasElement))).toBe(true);
  },
};

export const AutoOpen: Story = {
  render: () => <Harness autoOpen />,
  play: async () => {
    await waitFor(() => expect(isCalendarOpen()).toBe(true));
  },
};

const OpenFromOutside = () => {
  const ref = useRef<DateRangePickerHandle>(null);
  const [value, setValue] = useState<DateRangeValue | undefined>();
  return (
    <div
      className="flex flex-col items-start gap-[12px]"
      style={{ width: 400 }}
    >
      <DateRangePicker
        ref={ref}
        value={value}
        onChange={setValue}
        placeholder="Select date range"
      />
      <BaseButton
        variant="tertiary"
        size="sm"
        label="Custom…"
        onClick={() => ref.current?.open()}
      />
    </div>
  );
};

/** The imperative handle, as the maintenance window's "Custom…" chip uses. */
export const OpenThroughRef: Story = {
  render: () => <OpenFromOutside />,
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Custom…' }),
    );
    await waitFor(() => expect(isCalendarOpen()).toBe(true));
  },
};

// ── With times ──────────────────────────────────────────

/**
 * Timed ranges start both ends at noon and stay open, so the start and end
 * times can be set next.
 */
export const PickRangeAndTimes: Story = {
  render: () => <Harness enableTime />,
  play: async ({ canvasElement }) => {
    const field = fieldContainer(canvasElement);
    await openPicker(field);
    await expect(isTimeDisabled({ which: 'start' })).toBe(true);
    await expect(isTimeDisabled({ which: 'end' })).toBe(true);
    await pickDay('2026-06-10');
    await waitFor(() =>
      expect(partialOf(canvasElement)).toBe('2026-06-10T12:00'),
    );
    await pickDay('2026-06-12');
    await waitFor(() =>
      expect(readFormValue(canvasElement)).toEqual([
        '2026-06-10T12:00',
        '2026-06-12T12:00',
      ]),
    );
    await expect(isTimeDisabled({ which: 'start' })).toBe(false);
    await expect(isTimeDisabled({ which: 'end' })).toBe(false);
    await expect(isCalendarOpen()).toBe(true);
    await setTime(9, 15, { which: 'start' });
    await setTime(18, 0, { which: 'end' });
    await waitFor(() =>
      expect(readFormValue(canvasElement)).toEqual([
        '2026-06-10T09:15',
        '2026-06-12T18:00',
      ]),
    );
    await expect(displayValue(field)).toBe(
      '2026-06-10 09:15 to 2026-06-12 18:00',
    );
  },
};

/**
 * A datetime `maxDate` keeps later days out of reach and clamps a picked
 * end's time to it (noon on the last day is past 09:00).
 */
export const MaxDateClampsTheTime: Story = {
  render: () => <Harness enableTime maxDate={june(12, 9)} />,
  play: async ({ canvasElement }) => {
    await openPicker(fieldContainer(canvasElement));
    await expect(await isDayDisabled('2026-06-13')).toBe(true);
    await pickDay('2026-06-10');
    await pickDay('2026-06-12');
    await waitFor(() =>
      expect(readFormValue(canvasElement)).toEqual([
        '2026-06-10T12:00',
        '2026-06-12T09:00',
      ]),
    );
  },
};

/** Re-picking days keeps the times already on the value. */
export const RepickKeepsTimes: Story = {
  render: () => <Harness enableTime initial={[june(10, 9), june(12, 17)]} />,
  play: async ({ canvasElement }) => {
    await openPicker(fieldContainer(canvasElement));
    await pickDay('2026-06-20');
    await pickDay('2026-06-22');
    await waitFor(() =>
      expect(readFormValue(canvasElement)).toEqual([
        '2026-06-20T09:00',
        '2026-06-22T17:00',
      ]),
    );
  },
};

/**
 * When picking a single-day range, advancing start time past end time pushes
 * end time forward; moving end time before start time pulls start time back.
 */
export const SameDayTimeOrderEnforced: Story = {
  render: () => <Harness enableTime />,
  play: async ({ canvasElement }) => {
    const field = fieldContainer(canvasElement);
    await openPicker(field);
    await pickDay('2026-06-15');
    await pickDay('2026-06-15');
    await waitFor(() =>
      expect(readFormValue(canvasElement)).toEqual([
        '2026-06-15T12:00',
        '2026-06-15T12:00',
      ]),
    );
    await setTime(15, 0, { which: 'start' });
    await waitFor(() =>
      expect(readFormValue(canvasElement)).toEqual([
        '2026-06-15T15:00',
        '2026-06-15T15:00',
      ]),
    );
    await setTime(10, 0, { which: 'end' });
    await waitFor(() =>
      expect(readFormValue(canvasElement)).toEqual([
        '2026-06-15T10:00',
        '2026-06-15T10:00',
      ]),
    );
  },
};
