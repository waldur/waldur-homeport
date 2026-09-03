import { render } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DateTimeRangeField, DateTimeRangeHandle } from './DateTimeRangeField';

vi.mock('./useFlatpickrTheme', () => ({ useFlatpickrTheme: () => undefined }));

const captured: { options?: any; onCreate?: (instance: any) => void } = {};
vi.mock('react-flatpickr', () => ({
  default: (props: any) => {
    captured.options = props.options;
    captured.onCreate = props.onCreate;
    return null;
  },
}));

const renderField = (props: any = {}) =>
  render(
    <DateTimeRangeField
      input={{ value: undefined, onChange: vi.fn(), onBlur: vi.fn() }}
      {...props}
    />,
  );

describe('DateTimeRangeField', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 8, 2, 15, 31));
  });
  afterEach(() => vi.useRealTimers());

  it('picks date and time and floors at the next slot after now by default', () => {
    // The maintenance-window contract: a window is never scheduled backwards,
    // and it needs a time of day. A bare 'today' floor let Flatpickr stamp a
    // day picked from the calendar with its 12:00 default, which is already in
    // the past for any afternoon pick of today; a floor with a time of day
    // makes Flatpickr clamp that day's time instead.
    renderField();

    expect(captured.options.enableTime).toBe(true);
    expect(captured.options.minDate).toEqual(new Date(2026, 8, 2, 15, 45));
    // The format now derives from enableTime instead of being hardcoded, so
    // both the parse and the display format are pinned here too.
    expect(captured.options.dateFormat).toBe('Y-m-d H:i');
    expect(captured.options.altFormat).toBe('Y-m-d H:i');
  });

  it('rounds the floor up to the next minuteIncrement boundary', () => {
    renderField({ minuteIncrement: 30 });

    expect(captured.options.minDate).toEqual(new Date(2026, 8, 2, 16, 0));
  });

  it('drops the time inputs when enableTime is false', () => {
    renderField({ enableTime: false });

    expect(captured.options.enableTime).toBe(false);
  });

  it('removes the lower bound entirely when minDate is null', () => {
    // Distinct from omitting the prop: undefined falls back to the default
    // floor, so a consumer looking backwards in time had no way to opt out.
    renderField({ minDate: null });

    expect(captured.options.minDate).toBeUndefined();
  });

  it('marks the field touched when the calendar closes', () => {
    // The form's onBlur is bound to the original input, which Flatpickr turns
    // into type="hidden" once altInput is on, so it never fires on its own and
    // validation errors stayed invisible.
    const onBlur = vi.fn();
    renderField({ input: { value: undefined, onChange: vi.fn(), onBlur } });

    captured.options.onClose();

    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('opens the calendar through the instance handed to onCreate', () => {
    // react-flatpickr reads `props.ref`, which React 18 never populates for a
    // plain function component, so a forwarded ref silently stays null.
    const ref = createRef<DateTimeRangeHandle>();
    renderField({ ref });
    const open = vi.fn();
    captured.onCreate?.({ open });

    ref.current?.open();

    expect(open).toHaveBeenCalledTimes(1);
  });
});
