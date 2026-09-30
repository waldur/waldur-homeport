import type { Meta, StoryObj } from '@storybook/react-vite';
import { DateTime } from 'luxon';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { DateField } from './DateField';
import {
  DateFieldHarness,
  ValueReadout,
  closePicker,
  daysFromToday,
  displayValue,
  fieldContainer,
  hasTimeInput,
  isDayDisabled,
  openPicker,
  pickDay,
  placeholderText,
  readFormValue,
  readTouched,
  setTime,
} from './datePickerStoryHarness';
import { DateTimeField } from './DateTimeField';
import { DateTimeRangeField } from './DateTimeRangeField';
import { RangeDateField } from './RangeDateField';

/**
 * The react-final-form adapters over waldur-ui's DatePicker and
 * DateRangePicker: `DateField`, `DateTimeField`, `DateTimeRangeField` and
 * `RangeDateField` (behind `DateGroup`, `DateTimeGroup`, `DateEditField`
 * and the table's date filters).
 *
 * How the pickers behave — bounds, navigation, clearing, times, range
 * ordering — is specified once, by the `DatePicker` and `DateRangePicker`
 * stories next to this page. These stories cover only what the adapters
 * add: the shape of the stored value, marking the field touched when the
 * popup closes, options reaching the picker, and DateTimeRangeField's
 * maintenance-specific floor and partial-range handling.
 */
const meta: Meta = {
  title: 'Forms/Date & time/Form fields',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

// ── DateField: a bare ISO date ──────────────────────────

export const DateFieldStoresIsoDate: Story = {
  name: 'DateField · stores an ISO date',
  render: () => (
    <DateFieldHarness component={DateField} initialValue="2026-06-15" />
  ),
  play: async ({ canvasElement }) => {
    const field = fieldContainer(canvasElement);
    await expect(displayValue(field)).toBe('2026-06-15');
    await openPicker(field);
    await pickDay('2026-06-20');
    await waitFor(() =>
      expect(readFormValue(canvasElement)).toBe('2026-06-20'),
    );
  },
};

export const DateFieldClearStoresNull: Story = {
  name: 'DateField · clearing stores null',
  render: DateFieldStoresIsoDate.render,
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(fieldContainer(canvasElement)).getByRole('button', {
        name: 'Remove',
      }),
    );
    await waitFor(() => expect(readFormValue(canvasElement)).toBeNull());
  },
};

/** Closing the popup is the field's blur, so a `required` error shows. */
export const DateFieldMarksTouchedOnClose: Story = {
  name: 'DateField · closing marks it touched',
  render: DateFieldStoresIsoDate.render,
  play: async ({ canvasElement }) => {
    await expect(readTouched(canvasElement)).toBe(false);
    await openPicker(fieldContainer(canvasElement));
    await closePicker();
    await waitFor(() => expect(readTouched(canvasElement)).toBe(true));
  },
};

/** `minDate`, `maxDate` and `enable` reach the picker, as callers pass them. */
export const DateFieldForwardsOptions: Story = {
  name: 'DateField · passes bounds and enable on',
  render: () => (
    <DateFieldHarness
      component={DateField}
      initialValue="2026-06-15"
      fieldProps={{
        minDate: '2026-06-10',
        maxDate: '2026-06-20',
        enable: [(date: Date) => date.getDay() !== 0],
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    await openPicker(fieldContainer(canvasElement));
    await expect(await isDayDisabled('2026-06-09')).toBe(true);
    await expect(await isDayDisabled('2026-06-21')).toBe(true);
    await expect(await isDayDisabled('2026-06-14')).toBe(true); // a Sunday
    await expect(await isDayDisabled('2026-06-15')).toBe(false);
  },
};

// ── DateTimeField: an ISO datetime with offset ──────────

const initialIso = DateTime.local(2026, 6, 15, 8, 30).toISO();

/**
 * The form holds a string with the local offset (what the API client sends
 * as is), shown formatted; picks are stored the same way, and closing marks
 * the field touched.
 */
export const DateTimeFieldStoresIsoDateTime: Story = {
  name: 'DateTimeField · stores an ISO datetime',
  render: () => (
    <DateFieldHarness component={DateTimeField} initialValue={initialIso}>
      <code data-testid="raw-value">{initialIso}</code>
    </DateFieldHarness>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByTestId('raw-value').textContent,
    ).toMatch(/^2026-06-15T08:30:00\.000[+-]\d\d:\d\d$/);
    const field = fieldContainer(canvasElement);
    await expect(displayValue(field)).toBe('2026-06-15 08:30');
    await openPicker(field);
    await pickDay('2026-06-20');
    await setTime(18, 5);
    await waitFor(() =>
      expect(readFormValue(canvasElement)).toBe('2026-06-20T18:05'),
    );
    await closePicker();
    await waitFor(() => expect(readTouched(canvasElement)).toBe(true));
  },
};

// ── DateTimeRangeField: a maintenance window ────────────

/** Renders `onPartialStartChange` output next to the field. */
const MaintenanceRangeHarness = (props: Record<string, unknown>) => {
  const [partial, setPartial] = useState<Date | undefined>();
  return (
    <DateFieldHarness
      component={DateTimeRangeField}
      width={420}
      fieldProps={{ ...props, onPartialStartChange: setPartial }}
    >
      <ValueReadout
        label="Partial start"
        value={partial ?? null}
        testId="partial-start"
      />
    </DateFieldHarness>
  );
};

/** A maintenance window is never scheduled backwards. */
export const DateTimeRangeFieldFloorsAtNow: Story = {
  name: 'DateTimeRangeField · nothing before now',
  render: () => <MaintenanceRangeHarness />,
  play: async ({ canvasElement }) => {
    const field = fieldContainer(canvasElement);
    await expect(placeholderText(field)).toBe(
      'Pick a start and end date/time...',
    );
    await openPicker(field);
    await expect(await isDayDisabled(daysFromToday(-1))).toBe(true);
    await expect(await isDayDisabled(daysFromToday(1))).toBe(false);
  },
};

/** The form sees nothing until the range is complete; the parent does. */
export const DateTimeRangeFieldKeepsPartialOutOfForm: Story = {
  name: 'DateTimeRangeField · half a range stays out of the form',
  render: () => <MaintenanceRangeHarness minDate={null} />,
  play: async ({ canvasElement }) => {
    await openPicker(fieldContainer(canvasElement));
    await pickDay('2026-06-10');
    await waitFor(() =>
      expect(readFormValue(canvasElement, 'partial-start')).toBe(
        '2026-06-10T12:00',
      ),
    );
    await expect(readFormValue(canvasElement)).toBeNull();
    await pickDay('2026-06-12');
    await waitFor(() =>
      expect(readFormValue(canvasElement)).toEqual([
        '2026-06-10T12:00',
        '2026-06-12T12:00',
      ]),
    );
    await expect(readFormValue(canvasElement, 'partial-start')).toBeNull();
  },
};

export const DateTimeRangeFieldMarksTouchedOnClose: Story = {
  name: 'DateTimeRangeField · closing marks it touched',
  render: () => <MaintenanceRangeHarness />,
  play: async ({ canvasElement }) => {
    await expect(readTouched(canvasElement)).toBe(false);
    await openPicker(fieldContainer(canvasElement));
    await closePicker();
    await waitFor(() => expect(readTouched(canvasElement)).toBe(true));
  },
};

// ── RangeDateField: a table filter's { min, max } ───────

/** Filters look backwards and the backend parses bare dates. */
export const RangeDateFieldDateOnlyNoFloor: Story = {
  name: 'RangeDateField · date-only, no floor',
  render: () => <DateFieldHarness component={RangeDateField} />,
  play: async ({ canvasElement }) => {
    const field = fieldContainer(canvasElement);
    await expect(placeholderText(field)).toBe('Select date range');
    await openPicker(field);
    await expect(hasTimeInput()).toBe(false);
    await expect(await isDayDisabled(daysFromToday(-400))).toBe(false);
  },
};

export const RangeDateFieldStoresMinMax: Story = {
  name: 'RangeDateField · stores { min, max }',
  render: () => (
    <DateFieldHarness
      component={RangeDateField}
      initialValue={{ min: '2026-06-10', max: '2026-06-12' }}
    />
  ),
  play: async ({ canvasElement }) => {
    const field = fieldContainer(canvasElement);
    await expect(displayValue(field)).toBe('2026-06-10 to 2026-06-12');
    await openPicker(field);
    await pickDay('2026-07-01');
    await pickDay('2026-07-31');
    await waitFor(() =>
      expect(readFormValue(canvasElement)).toEqual({
        min: '2026-07-01',
        max: '2026-07-31',
      }),
    );
  },
};
