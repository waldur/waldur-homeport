import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DatePicker } from './DatePicker';
import { DateRangePicker, DateRangeValue } from './DateRangePicker';

const SingleHarness = ({
  initial = null,
  onClose,
}: {
  initial?: Date | null;
  onClose?: () => void;
}) => {
  const [value, setValue] = useState<Date | null>(initial);
  return <DatePicker value={value} onChange={setValue} onClose={onClose} />;
};

const textbox = () => screen.getByRole<HTMLInputElement>('textbox');

/** Puts the caret at `position` in the focused-to-be input. */
const placeCaret = (input: HTMLInputElement, position: number) => {
  input.focus();
  input.setSelectionRange(position, position);
};

describe('DateEntryInput editing', () => {
  it('Backspace over a separator deletes the digit before it', async () => {
    render(<SingleHarness initial={new Date(2026, 5, 15)} />);
    const input = textbox();
    placeCaret(input, 5); // 2026-|06-15
    await userEvent.keyboard('{Backspace}');
    expect(input).toHaveValue('2020-61-5');
  });

  it('Delete over a separator deletes the digit after it', async () => {
    render(<SingleHarness initial={new Date(2026, 5, 15)} />);
    const input = textbox();
    placeCaret(input, 4); // 2026|-06-15
    await userEvent.keyboard('{Delete}');
    expect(input).toHaveValue('2026-61-5');
  });

  it('keeps the caret in place when a keystroke is refused', async () => {
    render(<SingleHarness initial={new Date(2026, 5, 15)} />);
    const input = textbox();
    placeCaret(input, 6); // 2026-0|6-15
    await userEvent.keyboard('x');
    expect(input).toHaveValue('2026-06-15');
    expect(input.selectionStart).toBe(6);
  });

  it('Clear moves focus to the input without reporting a blur', async () => {
    const onClose = vi.fn();
    render(<SingleHarness initial={new Date(2026, 5, 15)} onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(textbox()).toHaveValue('');
    expect(textbox()).toHaveFocus();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('emptying a refused entry drops its message', async () => {
    render(<SingleHarness />);
    const input = textbox();
    await userEvent.type(input, '20261340{Enter}');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    await userEvent.clear(input);
    await userEvent.tab();
    expect(input).toHaveValue('');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(screen.queryByText('Enter a date as YYYY-MM-DD.')).toBeNull();
  });
});

const RangeHarness = ({
  initial,
  onPartialStartChange,
}: {
  initial?: DateRangeValue;
  onPartialStartChange?: (start?: Date) => void;
}) => {
  const [value, setValue] = useState<DateRangeValue | undefined>(initial);
  return (
    <>
      <DateRangePicker
        value={value}
        onChange={setValue}
        onPartialStartChange={onPartialStartChange}
      />
      <button type="button" onClick={() => setValue(undefined)}>
        Reset
      </button>
    </>
  );
};

const startInput = () =>
  screen.getByRole<HTMLInputElement>('textbox', { name: 'Start date' });
const endInput = () =>
  screen.getByRole<HTMLInputElement>('textbox', { name: 'End date' });

describe('DateRangePicker typed entries', () => {
  it('drops the partial start when the start is retyped as invalid', async () => {
    const onPartialStartChange = vi.fn();
    render(<RangeHarness onPartialStartChange={onPartialStartChange} />);
    await userEvent.type(startInput(), '20260910{Enter}');
    expect(onPartialStartChange).toHaveBeenLastCalledWith(
      new Date(2026, 8, 10),
    );
    await userEvent.clear(startInput());
    await userEvent.type(startInput(), '20261340{Enter}');
    expect(onPartialStartChange).toHaveBeenLastCalledWith(undefined);
    expect(startInput()).toHaveValue('2026-13-40');
    expect(startInput()).toHaveAttribute('aria-invalid', 'true');
  });

  it('a reset from outside clears a partial start', async () => {
    const onPartialStartChange = vi.fn();
    render(
      <RangeHarness
        initial={[new Date(2026, 5, 10), new Date(2026, 5, 12)]}
        onPartialStartChange={onPartialStartChange}
      />,
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Choose date range' }),
    );
    await userEvent.click(
      screen.getByRole('button', { name: /June 20th, 2026/ }),
    );
    expect(startInput()).toHaveValue('2026-06-20');
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(startInput()).toHaveValue('');
    expect(endInput()).toHaveValue('');
  });

  it('reports a start after the end on the start input', async () => {
    render(
      <RangeHarness initial={[new Date(2026, 5, 10), new Date(2026, 5, 12)]} />,
    );
    await userEvent.clear(startInput());
    await userEvent.type(startInput(), '20260620{Enter}');
    expect(startInput()).toHaveAttribute('aria-invalid', 'true');
    expect(startInput()).toHaveAccessibleDescription(
      /The start date must not be after the end date/,
    );
    expect(endInput()).not.toHaveAttribute('aria-invalid');
  });

  it('emptying a refused start drops its message', async () => {
    render(<RangeHarness />);
    await userEvent.type(startInput(), '20261340{Enter}');
    expect(startInput()).toHaveAttribute('aria-invalid', 'true');
    await userEvent.clear(startInput());
    await userEvent.tab();
    expect(startInput()).not.toHaveAttribute('aria-invalid');
  });
});

describe('DatePicker in a day-first locale', () => {
  afterEach(() => vi.restoreAllMocks());

  const useLocale = (locale: string) =>
    vi.spyOn(navigator, 'language', 'get').mockReturnValue(locale);

  it('takes a date typed in the regional order and shows it in ISO', async () => {
    useLocale('et-EE');
    const onChange = vi.fn();
    render(<DatePicker value={null} onChange={onChange} />);
    const input = textbox();
    await userEvent.type(input, '15.06.20');
    expect(input).toHaveValue('15.06.20');
    await userEvent.type(input, '26');
    expect(input).toHaveValue('2026-06-15');
    await userEvent.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 5, 15));
  });

  it('reformats a pasted regional date', async () => {
    useLocale('et-EE');
    render(<SingleHarness />);
    const input = textbox();
    input.focus();
    await userEvent.paste('15.06.2026');
    expect(input).toHaveValue('2026-06-15');
  });

  it('refuses a day-first date in a month-first locale', async () => {
    useLocale('en-US');
    render(<SingleHarness />);
    const input = textbox();
    await userEvent.type(input, '15/06/2026{Enter}');
    expect(input).toHaveValue('15/06/2026');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});
