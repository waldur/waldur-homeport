import type { Meta, StoryObj } from '@storybook/react-vite';
import { DateTime } from 'luxon';
import { ComponentProps, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { MonthPicker } from './MonthPicker';
import {
  Field,
  ValueReadout,
  displayValue,
  fieldContainer,
  isCalendarOpen,
  isMonthDisabled,
  isYearNavDisabled,
  openPicker,
  pickMonth,
  placeholderText,
  readFormValue,
  selectedMonth,
  shownYear,
} from './testing';

/**
 * `MonthPicker` — a month in a popup: the year with arrows over the twelve
 * months, in DatePicker's trigger and popover. It replaces
 * `<input type="month">` (billing and consumption periods). Value in: any
 * day of the month; value out: the month's first day.
 *
 * The trigger, clearing, disabled state and `autoOpen` are the shared
 * popover's and are specified by the DatePicker stories; these cover the
 * month grid.
 */
const meta: Meta<typeof MonthPicker> = {
  title: 'Forms/Date & time/MonthPicker',
  component: MonthPicker,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof MonthPicker>;

const Harness = ({
  initial = null,
  ...props
}: Partial<ComponentProps<typeof MonthPicker>> & { initial?: Date | null }) => {
  const [value, setValue] = useState<Date | null>(initial);
  return (
    <>
      <Field>
        <MonthPicker value={value} onChange={setValue} {...props} />
      </Field>
      <ValueReadout value={value} />
    </>
  );
};

/**
 * Empty, it shows the placeholder and opens on this year; a pick is stored
 * as the month's first day, shown as `yyyy-MM`, and closes the popup.
 */
export const PickAMonth: Story = {
  render: () => <Harness placeholder="Select a month" />,
  play: async ({ canvasElement }) => {
    const field = fieldContainer(canvasElement);
    await expect(placeholderText(field)).toBe('Select a month');
    await openPicker(field);
    const thisYear = DateTime.now().year;
    await expect(shownYear()).toBe(thisYear);
    await pickMonth(`${thisYear}-03`);
    await waitFor(() =>
      expect(readFormValue(canvasElement)).toBe(`${thisYear}-03-01T00:00`),
    );
    await expect(displayValue(field)).toBe(`${thisYear}-03`);
    await waitFor(() => expect(isCalendarOpen()).toBe(false));
  },
};

/**
 * A value opens on its own year, marked; paging to another year and
 * picking replaces it. Any day of the month is accepted as the value.
 */
export const WithValue: Story = {
  render: () => <Harness initial={new Date(2026, 5, 17)} />,
  play: async ({ canvasElement }) => {
    const field = fieldContainer(canvasElement);
    await expect(displayValue(field)).toBe('2026-06');
    await openPicker(field);
    await expect(shownYear()).toBe(2026);
    await expect(selectedMonth()).toBe('2026-06');
    await pickMonth('2024-11');
    await waitFor(() =>
      expect(readFormValue(canvasElement)).toBe('2024-11-01T00:00'),
    );
  },
};

/**
 * Bounds are month-granular and inclusive, and the arrows stop at the
 * bounds' years.
 */
export const Bounded: Story = {
  render: () => (
    <Harness
      initial={new Date(2026, 5, 1)}
      minDate="2025-11-15"
      maxDate="2026-08-01"
    />
  ),
  play: async ({ canvasElement }) => {
    await openPicker(fieldContainer(canvasElement));
    await expect(await isMonthDisabled('2026-08')).toBe(false);
    await expect(await isMonthDisabled('2026-09')).toBe(true);
    await expect(isYearNavDisabled('next')).toBe(true);
    await expect(await isMonthDisabled('2025-11')).toBe(false);
    await expect(await isMonthDisabled('2025-10')).toBe(true);
    await expect(isYearNavDisabled('prev')).toBe(true);
  },
};

export const Clear: Story = {
  render: () => <Harness initial={new Date(2026, 5, 1)} />,
  play: async ({ canvasElement }) => {
    const field = fieldContainer(canvasElement);
    await userEvent.click(
      within(field).getByRole('button', { name: 'Remove' }),
    );
    await waitFor(() => expect(readFormValue(canvasElement)).toBeNull());
    await expect(displayValue(field)).toBe('');
  },
};
