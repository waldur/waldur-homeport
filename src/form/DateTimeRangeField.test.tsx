import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DateTimeRangeField } from './DateTimeRangeField';

vi.mock('./useFlatpickrTheme', () => ({ useFlatpickrTheme: () => undefined }));

const captured: { options?: any } = {};
vi.mock('react-flatpickr', () => ({
  default: (props: any) => {
    captured.options = props.options;
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
  it('picks date and time and floors at today by default', () => {
    // The maintenance-window contract: a window is never scheduled backwards,
    // and it needs a time of day. Both new props must leave this untouched.
    renderField();

    expect(captured.options.enableTime).toBe(true);
    expect(captured.options.minDate).toBe('today');
    // The format now derives from enableTime instead of being hardcoded, so
    // both the parse and the display format are pinned here too.
    expect(captured.options.dateFormat).toBe('Y-m-d H:i');
    expect(captured.options.altFormat).toBe('Y-m-d H:i');
  });

  it('drops the time inputs when enableTime is false', () => {
    renderField({ enableTime: false });

    expect(captured.options.enableTime).toBe(false);
  });

  it('removes the lower bound entirely when minDate is null', () => {
    // Distinct from omitting the prop: undefined falls back to 'today', so a
    // consumer looking backwards in time had no way to opt out.
    renderField({ minDate: null });

    expect(captured.options.minDate).toBeUndefined();
  });
});
