import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { RangeDateField } from './RangeDateField';

vi.mock('./useFlatpickrTheme', () => ({ useFlatpickrTheme: () => undefined }));

// Capture the options object handed to Flatpickr so the onChange contract can
// be exercised without driving the real calendar widget.
const captured: { options?: any; value?: any } = {};
vi.mock('react-flatpickr', () => ({
  default: (props: any) => {
    captured.options = props.options;
    captured.value = props.value;
    return null;
  },
}));

const renderField = (value?: any) => {
  const onChange = vi.fn();
  render(<RangeDateField input={{ value, onChange }} />);
  return onChange;
};

describe('RangeDateField', () => {
  it('commits both bounds as ISO dates once a range is complete', () => {
    const onChange = renderField(undefined);

    captured.options.onChange([new Date(2026, 6, 1), new Date(2026, 6, 31)]);

    expect(onChange).toHaveBeenCalledWith({
      min: '2026-07-01',
      max: '2026-07-31',
    });
  });

  it('does not commit an intermediate single-date selection', () => {
    // Committing it would change the controlled value, which makes Flatpickr
    // re-apply `value` and abort the range pick in progress.
    const onChange = renderField(undefined);

    captured.options.onChange([new Date(2026, 6, 1)]);

    expect(onChange).not.toHaveBeenCalled();
  });

  it('clears to undefined so the filter drops out entirely', () => {
    const onChange = renderField({ min: '2026-07-01', max: '2026-07-31' });

    captured.options.onChange([]);

    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('drops the time picker and the past-date floor DateTimeRangeField defaults to', () => {
    // The two overrides that justify a separate component at all: the backend
    // parses bare dates, and a log filter only ever looks backwards.
    renderField(undefined);

    expect(captured.options.enableTime).toBe(false);
    expect(captured.options.minDate).toBeUndefined();
    expect(captured.options.dateFormat).toBe('Y-m-d');
  });

  it('keeps one stable array instance while empty', () => {
    // A fresh [] each render makes Flatpickr call setDate and wipe the
    // in-progress selection.
    const { rerender } = render(
      <RangeDateField input={{ value: undefined, onChange: vi.fn() }} />,
    );
    const first = captured.value;
    rerender(
      <RangeDateField input={{ value: undefined, onChange: vi.fn() }} />,
    );

    expect(captured.value).toBe(first);
  });
});
