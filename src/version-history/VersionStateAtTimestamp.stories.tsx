import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { expect, waitFor, within } from 'storybook/test';

import {
  displayValue,
  ensureOpen,
  isDayDisabled,
  isNavDisabled,
  openPicker,
  pickDay,
  setTime,
} from '@/form/datePickerStoryHarness';
import { daysFromToday } from '@/form/datePickerStoryHarness';

import { VersionStateAtTimestamp } from './VersionStateAtTimestamp';

/**
 * `VersionStateAtTimestamp` — a compact date + time picker (no form) on the
 * version-history panel, bounded above by now: history has no future.
 * Only the picker is exercised; "Load" would hit the API.
 *
 * Built on waldur-ui's date pickers, whose behaviour is specified under
 * `Forms/Date & time`; these stories cover this screen's own logic.
 */
const meta: Meta<typeof VersionStateAtTimestamp> = {
  title: 'Version history/VersionStateAtTimestamp',
  component: VersionStateAtTimestamp,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <div data-testid="field">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  args: {
    entityType: 'customer' as any,
    entityUuid: 'story',
    onVersionLoaded: () => undefined,
  },
};
export default meta;

type Story = StoryObj<typeof VersionStateAtTimestamp>;

const field = (canvasElement: HTMLElement) =>
  within(canvasElement).getByTestId('field');

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('button', { name: 'Load' }),
    ).toBeDisabled();
  },
};

export const FutureIsDisabled: Story = {
  play: async ({ canvasElement }) => {
    await openPicker(field(canvasElement));
    await expect(await isDayDisabled(daysFromToday(-1))).toBe(false);
    const tomorrow = DateTime.now().plus({ days: 1 });
    if (tomorrow.month === DateTime.now().month) {
      await expect(await isDayDisabled(tomorrow)).toBe(true);
    } else {
      // Tomorrow is next month, which the calendar won't page to at all.
      await expect(isNavDisabled('next')).toBe(true);
    }
  },
};

export const PickTimestamp: Story = {
  play: async ({ canvasElement }) => {
    await openPicker(field(canvasElement));
    await pickDay('2026-06-15');
    await ensureOpen(field(canvasElement));
    await setTime(9, 45);
    await waitFor(() =>
      expect(displayValue(field(canvasElement))).toBe('2026-06-15 09:45'),
    );
    await expect(
      within(canvasElement).getByRole('button', { name: 'Load' }),
    ).toBeEnabled();
  },
};
