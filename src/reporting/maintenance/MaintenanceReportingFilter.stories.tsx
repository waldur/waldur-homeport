import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, waitFor, within } from 'storybook/test';

import {
  displayValue,
  getTriggers,
  isDayDisabled,
  openPicker,
  pickDay,
} from '@/form/datePickerStoryHarness';
import { readFormValue } from '@/form/datePickerStoryHarness';

import { MaintenanceReportingFilter } from './MaintenanceReportingFilter';
import { MaintenanceFilterState } from './types';

/**
 * `MaintenanceReportingFilter` — two independent date pickers bounding each
 * other: the start can't pass the end and vice versa. Stores bare ISO dates.
 *
 * Built on waldur-ui's date pickers, whose behaviour is specified under
 * `Forms/Date & time`; these stories cover this screen's own logic.
 */
const meta: Meta<typeof MaintenanceReportingFilter> = {
  title: 'Reporting/MaintenanceReportingFilter',
  component: MaintenanceReportingFilter,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof MaintenanceReportingFilter>;

const Harness = () => {
  const [filter, setFilter] = useState<MaintenanceFilterState>({
    startDate: '2026-06-10',
    endDate: '2026-06-20',
  });
  return (
    <div>
      <div data-testid="field">
        <MaintenanceReportingFilter
          filter={filter}
          onFilterChange={(patch) => setFilter((f) => ({ ...f, ...patch }))}
        />
      </div>
      <code data-testid="form-value">
        {JSON.stringify({
          startDate: filter.startDate,
          endDate: filter.endDate,
        })}
      </code>
    </div>
  );
};

const pickers = (canvasElement: HTMLElement) => {
  const field = within(canvasElement).getByTestId('field');
  const [start, end] = getTriggers(field);
  return { field, start, end };
};

export const Default: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const { field, start, end } = pickers(canvasElement);
    await expect(displayValue(field, start)).toBe('2026-06-10');
    await expect(displayValue(field, end)).toBe('2026-06-20');
  },
};

/** The start picker stops at the chosen end date. */
export const StartBoundedByEnd: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const { field, start } = pickers(canvasElement);
    await openPicker(field, start);
    await expect(await isDayDisabled('2026-06-20')).toBe(false);
    await expect(await isDayDisabled('2026-06-21')).toBe(true);
    await pickDay('2026-06-05');
    await waitFor(() =>
      expect(readFormValue(canvasElement)).toEqual({
        startDate: '2026-06-05',
        endDate: '2026-06-20',
      }),
    );
  },
};

/** The end picker starts at the chosen start date. */
export const EndBoundedByStart: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const { field, end } = pickers(canvasElement);
    await openPicker(field, end);
    await expect(await isDayDisabled('2026-06-09')).toBe(true);
    await expect(await isDayDisabled('2026-06-10')).toBe(false);
    await pickDay('2026-07-02');
    await waitFor(() =>
      expect(readFormValue(canvasElement)).toEqual({
        startDate: '2026-06-10',
        endDate: '2026-07-02',
      }),
    );
  },
};
