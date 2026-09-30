import { DateTime } from 'luxon';
import {
  CSSProperties,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { translate } from 'waldur-i18n-runtime';

import { Calendar } from './Calendar';
import {
  DATE_FORMAT,
  DATE_TIME_FORMAT,
  DEFAULT_TIME,
  DateBound,
  boundsToDisabled,
  boundsToMonths,
  clampToBounds,
  withTime,
} from './dateBounds';
import { timeRowClassName } from './DatePicker';
import { DatePickerPopover, usePickerOpenState } from './DatePickerPopover';
import { TimeInput } from './TimeInput';
import { useCalendarLocale } from './useCalendarLocale';

export type DateRangeValue = [Date, Date];

export interface DateRangePickerHandle {
  /** Opens the popup, e.g. from a "Custom…" button beside the picker. */
  open(): void;
}

export interface DateRangePickerProps {
  value: DateRangeValue | null | undefined;
  onChange(value: DateRangeValue | undefined): void;
  /** Adds start and end time inputs; the popup then stays open after a pick. */
  enableTime?: boolean;
  /** Inclusive, day-granular in the calendar; exact once a time is set. */
  minDate?: DateBound;
  maxDate?: DateBound;
  /** Minutes between allowed times (the time inputs' step). */
  minuteStep?: number;
  /**
   * Called after the first day of a range is picked and before the second,
   * with that start; then with `undefined` once the range is complete.
   */
  onPartialStartChange?(start?: Date): void;
  placeholder?: string;
  disabled?: boolean;
  solid?: boolean;
  size?: 'sm';
  /** Offer a remove button while there is a value. Defaults to false. */
  clearable?: boolean;
  /** Called when the popup closes — the field's blur. */
  onClose?(): void;
  /** Open the popup as soon as the picker mounts (table filters). */
  autoOpen?: boolean;
  id?: string;
  style?: CSSProperties;
}

const timeOf = (date: Date | undefined) =>
  date ? { hour: date.getHours(), minute: date.getMinutes() } : DEFAULT_TIME;

/**
 * A start and end (optionally with times) on one control, in a popup
 * calendar. Plain `[Date, Date]` in and out — the app's react-final-form
 * adapters are DateTimeRangeField and RangeDateField (src/form).
 *
 * - Nothing is committed until both ends are picked. The first click is
 *   only reported through `onPartialStartChange`, and survives closing the
 *   popup so the parent can complete the range some other way; a value set
 *   from outside replaces it.
 * - Clicks are ordered, so picking the end first works, and the same day
 *   twice is a one-day range.
 * - Picked days keep the times already on the value (editing a range),
 *   else start at noon; date-only ranges sit at midnight.
 */
export const DateRangePicker = forwardRef<
  DateRangePickerHandle,
  DateRangePickerProps
>(function DateRangePicker(
  {
    value,
    onChange,
    enableTime,
    minDate,
    maxDate,
    minuteStep,
    onPartialStartChange,
    placeholder,
    disabled,
    solid,
    size,
    clearable = false,
    onClose,
    autoOpen,
    id,
    style,
  },
  ref,
) {
  const [open, setOpen] = usePickerOpenState(autoOpen);
  const [draftStart, setDraftStart] = useState<Date | undefined>();
  const locale = useCalendarLocale();

  useImperativeHandle(ref, () => ({ open: () => setOpen(true) }), []);

  const startMs = value?.[0].getTime();
  const endMs = value?.[1].getTime();
  useEffect(() => setDraftStart(undefined), [startMs, endMs]);

  const clamp = (dt: DateTime) =>
    clampToBounds(dt, minDate, maxDate).toJSDate();

  const stamp = (day: Date, index: 0 | 1) =>
    clamp(
      enableTime
        ? withTime(day, timeOf(value?.[index]))
        : DateTime.fromJSDate(day).startOf('day'),
    );

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) onClose?.();
  };

  const handleDayClick = (day: Date, modifiers: Record<string, boolean>) => {
    if (modifiers.disabled) return;
    if (!draftStart) {
      const start = stamp(day, 0);
      setDraftStart(start);
      onPartialStartChange?.(start);
      return;
    }
    const [first, second] =
      day < DateTime.fromJSDate(draftStart).startOf('day').toJSDate()
        ? [day, draftStart]
        : [draftStart, day];
    onChange([stamp(first, 0), stamp(second, 1)]);
    setDraftStart(undefined);
    onPartialStartChange?.(undefined);
    if (!enableTime) handleOpenChange(false);
  };

  const handleTimeChange =
    (index: 0 | 1) => (time: { hour: number; minute: number }) => {
      if (!value) return;
      const next: DateRangeValue = [...value];
      next[index] = clamp(withTime(value[index], time));
      if (index === 0 && next[0] > next[1]) {
        next[1] = next[0];
      } else if (index === 1 && next[1] < next[0]) {
        next[0] = next[1];
      }
      onChange(next);
    };

  const format = enableTime ? DATE_TIME_FORMAT : DATE_FORMAT;
  const displayValue = value
    ? (translate('{start} to {end}', {
        start: DateTime.fromJSDate(value[0]).toFormat(format),
        end: DateTime.fromJSDate(value[1]).toFormat(format),
      }) as string)
    : undefined;

  return (
    <DatePickerPopover
      open={open}
      onOpenChange={handleOpenChange}
      displayValue={displayValue}
      placeholder={placeholder}
      disabled={disabled}
      solid={solid}
      size={size}
      onClear={clearable ? () => onChange(undefined) : undefined}
      id={id}
      style={style}
    >
      <Calendar
        mode="range"
        autoFocus
        // Always defined, so the calendar never falls back to tracking
        // clicks itself: selection is driven by handleDayClick alone.
        selected={
          draftStart
            ? { from: draftStart, to: undefined }
            : { from: value?.[0], to: value?.[1] }
        }
        onSelect={() => undefined}
        onDayClick={handleDayClick}
        defaultMonth={draftStart ?? value?.[0]}
        weekStartsOn={1}
        locale={locale}
        disabled={boundsToDisabled(minDate, maxDate)}
        {...boundsToMonths(minDate, maxDate)}
      />
      {enableTime ? (
        <div className={timeRowClassName}>
          <TimeInput
            label={translate('Start time')}
            value={value ? DateTime.fromJSDate(value[0]) : undefined}
            onChange={handleTimeChange(0)}
            disabled={!value}
            minuteStep={minuteStep}
          />
          <span className="text-[var(--surface-text-muted)]">–</span>
          <TimeInput
            label={translate('End time')}
            value={value ? DateTime.fromJSDate(value[1]) : undefined}
            onChange={handleTimeChange(1)}
            disabled={!value}
            minuteStep={minuteStep}
          />
        </div>
      ) : null}
    </DatePickerPopover>
  );
});
