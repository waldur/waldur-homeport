import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DateTimeRangeField } from './DateTimeRangeField';

// Day buttons are labelled like "Wednesday, September 2nd, 2026".
const day = (label: string) =>
  screen.getByRole('button', { name: new RegExp(label) });

const renderField = (props: any = {}) => {
  const input = { value: undefined, onChange: vi.fn(), onBlur: vi.fn() };
  const onPartialStartChange = vi.fn();
  render(
    <DateTimeRangeField
      input={input}
      onPartialStartChange={onPartialStartChange}
      {...props}
    />,
  );
  return { onPartialStartChange };
};

const open = () =>
  userEvent.click(
    screen.getByRole('button', { name: 'Pick a start and end date/time...' }),
  );

// Only the "not before now" floor's exact rounding lives here: it needs a
// frozen clock. Everything else about the field is in its stories
// (Forms/Date & time/Form fields).
describe('DateTimeRangeField', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 8, 2, 15, 31));
  });
  afterEach(() => vi.useRealTimers());

  it('floors a pick of today at the next slot after now', async () => {
    // The maintenance-window contract: a window is never scheduled backwards.
    // A pick of today is clamped to a time still ahead rather than stamped
    // with noon, which is already past for an afternoon pick.
    const { onPartialStartChange } = renderField();
    await open();

    await userEvent.click(day('September 2nd, 2026'));

    expect(onPartialStartChange).toHaveBeenCalledWith(
      new Date(2026, 8, 2, 15, 45),
    );
  });

  it('rounds the floor up to the next minuteIncrement boundary', async () => {
    const { onPartialStartChange } = renderField({ minuteIncrement: 30 });
    await open();

    await userEvent.click(day('September 2nd, 2026'));

    expect(onPartialStartChange).toHaveBeenCalledWith(
      new Date(2026, 8, 2, 16, 0),
    );
  });
});
