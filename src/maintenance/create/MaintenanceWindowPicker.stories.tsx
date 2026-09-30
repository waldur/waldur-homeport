import type { Meta, StoryObj } from '@storybook/react-vite';
import { DateTime } from 'luxon';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  closePicker,
  isCalendarOpen,
  openPicker,
  pickDay,
} from '@/form/datePickerStoryHarness';
import {
  DateFieldHarness,
  fieldContainer,
  readFormValue,
} from '@/form/datePickerStoryHarness';

import { validateWindow } from '../utils';

import { MaintenanceWindowPicker } from './MaintenanceWindowPicker';

/**
 * `MaintenanceWindowPicker` — `DateTimeRangeField` plus quick chips, in the
 * create-maintenance wizard. The chips depend on the range field's partial
 * start (the first calendar click) and its imperative `open()`, so this is
 * the end-to-end check of both.
 *
 * Built on waldur-ui's date pickers, whose behaviour is specified under
 * `Forms/Date & time`; these stories cover this screen's own logic.
 */
const meta: Meta<typeof MaintenanceWindowPicker> = {
  title: 'Maintenance/MaintenanceWindowPicker',
  component: MaintenanceWindowPicker,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof MaintenanceWindowPicker>;

const render = () => (
  <DateFieldHarness
    component={MaintenanceWindowPicker}
    width={560}
    validate={(value) => validateWindow(value)}
  />
);

const chip = (canvasElement: HTMLElement, name: RegExp | string) =>
  within(canvasElement).getByRole('button', { name });

export const Default: Story = {
  render,
  play: async ({ canvasElement }) => {
    await expect(chip(canvasElement, '+1 h from start')).toBeDisabled();
    await expect(chip(canvasElement, '+4 h from start')).toBeDisabled();
  },
};

export const TomorrowChip: Story = {
  render,
  play: async ({ canvasElement }) => {
    await userEvent.click(chip(canvasElement, 'Tomorrow 22:00 – 02:00'));
    const start = DateTime.now().plus({ days: 1 }).set({ hour: 22, minute: 0 });
    await waitFor(() =>
      expect(readFormValue(canvasElement)).toEqual([
        start.toFormat("yyyy-MM-dd'T'HH:mm"),
        start.plus({ hours: 4 }).toFormat("yyyy-MM-dd'T'HH:mm"),
      ]),
    );
    await expect(
      within(canvasElement).getByText('Window: 4 h 0 m'),
    ).toBeInTheDocument();
  },
};

/** The first calendar click is enough to enable the start-relative chips. */
export const StartRelativeChipAfterFirstClick: Story = {
  render,
  play: async ({ canvasElement }) => {
    const day = DateTime.now().plus({ days: 3 });
    await openPicker(fieldContainer(canvasElement));
    await pickDay(day.toISODate());
    await closePicker();
    await waitFor(() =>
      expect(chip(canvasElement, '+4 h from start')).toBeEnabled(),
    );
    await userEvent.click(chip(canvasElement, '+4 h from start'));
    await waitFor(() => {
      const [start, end] = readFormValue(canvasElement) as string[];
      expect(start.slice(0, 10)).toBe(day.toISODate());
      expect(
        DateTime.fromISO(end).diff(DateTime.fromISO(start), 'hours').hours,
      ).toBe(4);
    });
  },
};

export const CustomChipOpensCalendar: Story = {
  render,
  play: async ({ canvasElement }) => {
    await expect(isCalendarOpen()).toBe(false);
    await userEvent.click(chip(canvasElement, 'Custom…'));
    await waitFor(() => expect(isCalendarOpen()).toBe(true));
  },
};

/** A zero-length window is rejected once the popup closes. */
export const ValidationAfterClose: Story = {
  render,
  play: async ({ canvasElement }) => {
    const day = DateTime.now().plus({ days: 3 }).toISODate();
    await openPicker(fieldContainer(canvasElement));
    await pickDay(day);
    await pickDay(day);
    await expect(
      within(canvasElement).queryByText('End must be after start.'),
    ).toBeNull();
    await closePicker();
    await waitFor(() =>
      expect(
        within(canvasElement).getByText('End must be after start.'),
      ).toBeInTheDocument(),
    );
  },
};
