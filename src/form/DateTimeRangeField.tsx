import { DateTime } from 'luxon';
import { forwardRef, useMemo } from 'react';

import { DateRangePicker, DateRangePickerHandle } from 'waldur-ui';

import { translate } from '@/i18n';

import { FormField } from './types';

export type DateTimeRangeHandle = DateRangePickerHandle;

type DateTimeRangeFieldProps = FormField & {
  placeholder?: string;
  /**
   * `null` removes the lower bound; omitting it floors at the next
   * `minuteIncrement` slot after mount time.
   */
  minDate?: Date | string | null;
  minuteIncrement?: number;
  /** Set false for a date-only range, e.g. filtering a log by day. */
  enableTime?: boolean;
  /**
   * Called while a range is being picked, after the first date is chosen but
   * before the second. Lets the parent react to the in-progress start date
   * (the "+N h from start" chips) without it being committed to the form.
   */
  onPartialStartChange?: (start?: Date) => void;
  /** Open the calendar on mount — set by the table's date filters. */
  autoOpen?: boolean;
};

// Next `increment`-minute boundary strictly after now: the default lower
// bound. It carries a time of day, so a pick of today is clamped to a time
// that is still ahead rather than stamped with noon, which is already past
// for an afternoon pick.
const nextSlotAfterNow = (increment: number): DateTime => {
  const now = DateTime.now().startOf('minute');
  const remainder = now.minute % increment;
  return now.plus({ minutes: increment - remainder });
};

const toRange = (value: unknown): [Date, Date] | undefined =>
  Array.isArray(value) &&
  value.length === 2 &&
  value[0] instanceof Date &&
  value[1] instanceof Date
    ? [value[0], value[1]]
    : undefined;

/**
 * react-final-form adapter over waldur-ui's DateRangePicker, storing
 * `[Date, Date]` in form state. Designed for maintenance windows (date +
 * time, floored at now by default); used date-only by RangeDateField.
 */
export const DateTimeRangeField = forwardRef<
  DateTimeRangeHandle,
  DateTimeRangeFieldProps
>(function DateTimeRangeField(
  {
    input,
    onPartialStartChange,
    minDate,
    minuteIncrement,
    enableTime = true,
    disabled,
    placeholder,
    autoOpen,
  },
  ref,
) {
  const increment = minuteIncrement ?? 15;
  const defaultFloor = useMemo(() => nextSlotAfterNow(increment), [increment]);

  return (
    <DateRangePicker
      ref={ref}
      value={toRange(input.value)}
      onChange={input.onChange}
      // The field's blur: closing is when the user is done with it.
      onClose={() => input.onBlur?.()}
      onPartialStartChange={onPartialStartChange}
      enableTime={enableTime}
      minDate={minDate === null ? undefined : (minDate ?? defaultFloor)}
      minuteStep={increment}
      placeholder={
        placeholder ?? translate('Pick a start and end date/time...')
      }
      disabled={disabled}
      autoOpen={autoOpen}
    />
  );
});
