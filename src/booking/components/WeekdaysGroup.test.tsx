import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { WeekdaysGroup } from './WeekdaysGroup';

describe('WeekdaysGroup', () => {
  it('shows seven weekday toggles, Sunday first, with the chosen ones checked', () => {
    render(<WeekdaysGroup daysOfWeek={[1, 3]} setDaysOfWeek={() => {}} />);
    const boxes = screen.getAllByRole<HTMLInputElement>('checkbox');
    expect(boxes.map((box) => box.value)).toEqual([
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
    ]);
    expect(boxes.filter((box) => box.checked).map((box) => box.value)).toEqual([
      '1',
      '3',
    ]);
  });

  it('gives each toggle its own id, which its label points at', () => {
    render(<WeekdaysGroup daysOfWeek={[]} setDaysOfWeek={() => {}} />);
    const ids = screen
      .getAllByRole<HTMLInputElement>('checkbox')
      .map((box) => box.id);
    expect(new Set(ids).size).toBe(7);
    expect(ids.every(Boolean)).toBe(true);
  });

  it('toggles a day by clicking its label', async () => {
    const setDaysOfWeek = vi.fn();
    render(<WeekdaysGroup daysOfWeek={[1]} setDaysOfWeek={setDaysOfWeek} />);
    const second = screen.getAllByRole<HTMLInputElement>('checkbox')[2];
    await userEvent.click(second);
    expect(setDaysOfWeek).toHaveBeenCalledTimes(1);
    expect(setDaysOfWeek.mock.calls[0][0]).toContain(2);
  });
});
