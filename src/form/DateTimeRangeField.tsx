import { CalendarBlankIcon } from '@phosphor-icons/react';
import flatpickr from 'flatpickr';
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import Flatpickr, { DateTimePickerProps } from 'react-flatpickr';

import { translate } from '@/i18n';

import { FormField } from './types';
import { useFlatpickrTheme } from './useFlatpickrTheme';

export interface DateTimeRangeHandle {
  open(): void;
}

type DateTimeRangeFieldProps = FormField &
  Pick<DateTimePickerProps, 'placeholder' | 'disabled'> & {
    /**
     * `null` removes the lower bound; omitting it floors at the next
     * `minuteIncrement` slot after mount time.
     */
    minDate?: Date | string | null;
    minuteIncrement?: number;
    dateFormat?: string;
    /** Set false for a date-only range, e.g. filtering a log by day. */
    enableTime?: boolean;
    /**
     * Called while a range is being picked, after the first date is chosen but
     * before the second. Lets the parent react to the in-progress start date
     * without committing it to the controlled form value (which would feed back
     * into Flatpickr and abort the range selection).
     */
    onPartialStartChange?: (start?: Date) => void;
  };

// Stable empty-value reference. Flatpickr re-applies its `value` prop (calling
// setDate, which clears the in-progress selection) whenever the reference
// changes, so an empty state must always be the same array instance.
const EMPTY_VALUE: Date[] = [];

// Next `increment`-minute boundary strictly after now. Used as the default
// lower bound: a floor with a time of day makes Flatpickr clamp the time of a
// day picked from the calendar, whereas a bare 'today' floor let it stamp the
// day with its 12:00 default — already in the past for an afternoon pick.
const nextSlotAfterNow = (increment: number): Date => {
  const slot = new Date();
  slot.setSeconds(0, 0);
  slot.setMinutes(
    Math.floor(slot.getMinutes() / increment) * increment + increment,
  );
  return slot;
};

/**
 * Flatpickr-backed range picker that stores `[Date, Date]` in form state.
 * Designed for selecting a maintenance window with date + time on a single control.
 */
export const DateTimeRangeField = forwardRef<
  DateTimeRangeHandle,
  DateTimeRangeFieldProps
>(function DateTimeRangeField(props, ref) {
  useFlatpickrTheme();

  const { onChange, onBlur, value: inputValue } = props.input;
  const {
    onPartialStartChange,
    minDate,
    minuteIncrement,
    dateFormat,
    enableTime = true,
  } = props;

  // react-flatpickr reads `props.ref`, which React 18 never populates for a
  // plain function component, so its forwarded ref stays null. The instance
  // is captured through its onCreate/onDestroy callbacks instead; both must be
  // stable because the library keys its create/destroy effect on them.
  const instanceRef = useRef<flatpickr.Instance | undefined>(undefined);
  const handleCreate = useCallback((instance?: flatpickr.Instance | null) => {
    instanceRef.current = instance ?? undefined;
  }, []);
  const handleDestroy = useCallback(() => {
    instanceRef.current = undefined;
  }, []);
  useImperativeHandle(ref, () => ({
    open: () => instanceRef.current?.open(),
  }));

  const increment = minuteIncrement ?? 15;
  const defaultMinDate = useMemo(
    () => nextSlotAfterNow(increment),
    [increment],
  );

  const value = Array.isArray(inputValue)
    ? (inputValue as Date[])
    : EMPTY_VALUE;

  // Memoize the options (including the onChange hook). react-flatpickr keys its
  // create/destroy effect on the options object identity — a fresh object each
  // render would destroy and recreate the Flatpickr instance, closing the
  // calendar mid-selection. The onChange hook lives inside the options so the
  // library does not mutate-and-grow it on every render.
  const options = useMemo(() => {
    const format = dateFormat ?? (enableTime ? 'Y-m-d H:i' : 'Y-m-d');
    return {
      mode: 'range' as const,
      enableTime,
      time_24hr: true,
      minuteIncrement: increment,
      dateFormat: format,
      // Use a Flatpickr-managed display input. react-flatpickr renders the real
      // (now hidden) input as React-controlled with `value.toString()`; without
      // altInput a re-render would overwrite Flatpickr's formatted text with the
      // raw Date array string. altInput keeps the formatted display intact.
      altInput: true,
      altFormat: format,
      altInputClass: 'form-control',
      // Grey out past dates by default; a maintenance window is never scheduled
      // in the past. Callers override via `minDate`, and pass null to remove the
      // bound outright — a filter over recorded history only looks backwards.
      minDate: minDate === null ? undefined : (minDate ?? defaultMinDate),
      allowInput: false,
      // The form's onBlur is bound to the original input, which Flatpickr turns
      // into type="hidden" once altInput is on, so it never fires on its own.
      // Closing the calendar is the moment the user is done with the field.
      onClose: () => onBlur(),
      onChange: (dates: Date[]) => {
        if (dates.length === 2) {
          onChange([dates[0], dates[1]]);
          onPartialStartChange?.(undefined);
        } else if (dates.length === 1) {
          // Intermediate selection: surface the start date for the parent's
          // chip buttons, but do NOT commit it to the controlled value — that
          // would change Flatpickr's `value` prop and reset the in-progress
          // range pick.
          onPartialStartChange?.(dates[0]);
        } else {
          onChange(undefined);
          onPartialStartChange?.(undefined);
        }
      },
    };
  }, [
    onChange,
    onBlur,
    onPartialStartChange,
    minDate,
    defaultMinDate,
    increment,
    dateFormat,
    enableTime,
  ]);

  return (
    <div style={{ position: 'relative' }}>
      <Flatpickr
        value={value}
        options={options}
        onCreate={handleCreate}
        onDestroy={handleDestroy}
        className="form-control"
        placeholder={
          props.placeholder ?? translate('Pick a start and end date/time...')
        }
        disabled={props.disabled}
      />
      <span
        className="svg-icon svg-icon-2 svg-icon-gray-500"
        style={{
          position: 'absolute',
          right: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
        }}
      >
        <CalendarBlankIcon weight="bold" />
      </span>
    </div>
  );
});
