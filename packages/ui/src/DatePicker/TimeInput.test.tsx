import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import { describe, expect, it, vi } from 'vitest';

import { TimeInput } from './TimeInput';

const renderInput = (props: Partial<Parameters<typeof TimeInput>[0]> = {}) => {
  const onChange = vi.fn();
  render(<TimeInput label="Time" onChange={onChange} {...props} />);
  return {
    onChange,
    hour: screen.getByLabelText('Hour'),
    minute: screen.getByLabelText('Minute'),
  };
};

describe('TimeInput', () => {
  it('shows 24-hour values, and 12:00 when there is no time yet', () => {
    const { hour, minute } = renderInput({
      value: DateTime.local(2026, 6, 15, 18, 5),
    });
    expect(hour).toHaveValue('18');
    expect(minute).toHaveValue('05');
  });

  it('defaults to 12:00', () => {
    const { hour, minute } = renderInput();
    expect(hour).toHaveValue('12');
    expect(minute).toHaveValue('00');
  });

  it('commits a typed hour on Enter, keeping the minute', async () => {
    const { onChange, hour } = renderInput({
      value: DateTime.local(2026, 6, 15, 8, 30),
    });
    await userEvent.clear(hour);
    await userEvent.type(hour, '14');
    expect(onChange).not.toHaveBeenCalled();

    await userEvent.type(hour, '{Enter}');

    expect(onChange).toHaveBeenCalledWith({ hour: 14, minute: 30 });
  });

  it('commits on blur and ignores out-of-range input', async () => {
    const { onChange, hour, minute } = renderInput({
      value: DateTime.local(2026, 6, 15, 8, 30),
    });
    await userEvent.clear(minute);
    await userEvent.type(minute, '45');
    await userEvent.click(hour);
    expect(onChange).toHaveBeenLastCalledWith({ hour: 8, minute: 45 });

    await userEvent.clear(hour);
    await userEvent.type(hour, '27{Enter}');
    expect(onChange).toHaveBeenCalledTimes(1);
    // The rejected draft is dropped; the field shows the value again.
    expect(hour).toHaveValue('08');
  });

  it('steps with the arrow keys, wrapping around', async () => {
    const { onChange, hour, minute } = renderInput({
      value: DateTime.local(2026, 6, 15, 23, 0),
      minuteStep: 15,
    });
    await userEvent.click(hour);
    await userEvent.keyboard('{ArrowUp}');
    expect(onChange).toHaveBeenLastCalledWith({ hour: 0, minute: 0 });

    await userEvent.click(minute);
    await userEvent.keyboard('{ArrowDown}');
    expect(onChange).toHaveBeenLastCalledWith({ hour: 23, minute: 45 });
  });
});
