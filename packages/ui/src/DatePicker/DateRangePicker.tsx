import { DateTime } from 'luxon';
import {
  CSSProperties,
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
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
import { validateEntry } from './dateEntry';
import { timeRowClassName } from './DatePicker';
import {
  DateEntryInput,
  DatePickerPopover,
  formatHint,
  formatPlaceholder,
  joinIds,
  useEntryText,
  usePickerOpenState,
  useReportEntryError,
} from './DatePickerPopover';
import { DateMask } from './maskedDate';
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
  /** The field's blur: the popup closed, or focus left the input. */
  onClose?(): void;
  /** Open the popup as soon as the picker mounts (table filters). */
  autoOpen?: boolean;
  /** On the start input, so a `<label for>` lands in the field. */
  id?: string;
  /** Names the group of both inputs; else `placeholder` does. */
  'aria-label'?: string;
  /** Names the group of both inputs by the field's label. */
  'aria-labelledby'?: string;
  /** The form's error state; a refused entry sets it by itself. */
  'aria-invalid'?: boolean;
  /** Called with the message of a refused entry, or `null` once there is none. */
  onEntryErrorChange?(message: string | null): void;
  /** More descriptions (the form's description and error) for both inputs. */
  'aria-describedby'?: string;
  style?: CSSProperties;
}

const timeOf = (date: Date | undefined) =>
  date ? { hour: date.getHours(), minute: date.getMinutes() } : DEFAULT_TIME;

/**
 * A start and end (optionally with times): two masked text inputs in one
 * named group, each typed like DatePicker's, with a popup calendar behind
 * the button beside them. Plain `[Date, Date]` in and out — the app's
 * react-final-form adapters are DateTimeRangeField and RangeDateField
 * (src/form).
 *
 * - Typed ends are committed on Enter or blur. A start alone is a partial
 *   start, like a first calendar click; an end before the start, or either
 *   end outside the bounds, stays in its input and is reported, and the
 *   value is emptied rather than reordered or clamped.
 * - A polite live region narrates a calendar pick ("Start date selected,
 *   choose end date").
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
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-invalid': ariaInvalid,
    'aria-describedby': ariaDescribedBy,
    onEntryErrorChange,
    style,
  },
  ref,
) {
  const [open, setOpen] = usePickerOpenState(autoOpen);
  const [draftStart, setDraftStart] = useState<Date | undefined>();
  const [announcement, setAnnouncement] = useState('');
  const locale = useCalendarLocale();
  const baseId = useId();
  const hintId = `${baseId}-hint`;
  const startErrorId = `${baseId}-start-error`;
  const endErrorId = `${baseId}-end-error`;

  useImperativeHandle(ref, () => ({ open: () => setOpen(true) }), []);

  // A value changed from outside — a new range, or a reset — replaces a
  // partial start. Emptying it from here (a refused entry, a cleared end)
  // keeps it: the user is still typing the range.
  const startMs = value?.[0].getTime();
  const endMs = value?.[1].getTime();
  const emptiedHere = useRef(false);
  useEffect(() => {
    if (emptiedHere.current) {
      emptiedHere.current = false;
      return;
    }
    setDraftStart(undefined);
  }, [startMs, endMs]);

  const mask: DateMask = enableTime ? 'datetime' : 'date';
  const format = enableTime ? DATE_TIME_FORMAT : DATE_FORMAT;
  const show = (date: Date | undefined) =>
    date ? DateTime.fromJSDate(date).toFormat(format) : '';
  const startEntry = useEntryText(show(draftStart ?? value?.[0]));
  const endEntry = useEntryText(draftStart ? '' : show(value?.[1]));
  useReportEntryError(startEntry.error ?? endEntry.error, onEntryErrorChange);

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
    setAnnouncement('');
    if (!next) onClose?.();
  };

  const setPartialStart = (start: Date | undefined) => {
    setDraftStart(start);
    onPartialStartChange?.(start);
  };

  const handleDayClick = (day: Date, modifiers: Record<string, boolean>) => {
    if (modifiers.disabled) return;
    if (!draftStart) {
      setPartialStart(stamp(day, 0));
      setAnnouncement(
        translate('Start date selected, choose end date') as string,
      );
      return;
    }
    const [first, second] =
      day < DateTime.fromJSDate(draftStart).startOf('day').toJSDate()
        ? [day, draftStart]
        : [draftStart, day];
    const range: DateRangeValue = [stamp(first, 0), stamp(second, 1)];
    onChange(range);
    setPartialStart(undefined);
    setAnnouncement(
      translate('{start} to {end} selected', {
        start: show(range[0]),
        end: show(range[1]),
      }) as string,
    );
    if (!enableTime) handleOpenChange(false);
  };

  /** A typed end as a Date, stamped the way a calendar pick would be. */
  const readEntry = (text: string, index: 0 | 1) => {
    const result = validateEntry(text, mask, { minDate, maxDate });
    if (result.status !== 'ok') return result;
    const date =
      enableTime && result.hasTime
        ? clamp(result.value)
        : stamp(result.value.toJSDate(), index);
    return { status: 'ok' as const, date };
  };

  const commitEntry = (index: 0 | 1) => () => {
    const [own, other] =
      index === 0 ? [startEntry, endEntry] : [endEntry, startEntry];
    const start = readEntry(startEntry.text, 0);
    const end = readEntry(endEntry.text, 1);
    const result = index === 0 ? start : end;
    const emptyValue = () => {
      if (!value) return;
      emptiedHere.current = true;
      other.keep();
      onChange(undefined);
    };
    if (result.status === 'error') {
      // A refused start is no partial start either. Dropping the partial
      // start empties what the start input mirrors, so keep the entry.
      const dropsDraft = index === 0 && !!draftStart;
      own.refuse(result.message, !!value || dropsDraft);
      if (dropsDraft) setPartialStart(undefined);
      emptyValue();
      return;
    }
    if (result.status === 'empty') {
      own.accept('');
      emptyValue();
      if (index === 0) {
        if (draftStart) setPartialStart(undefined);
      } else if (start.status === 'ok') {
        // A start without an end: a partial start, as after a first click.
        setPartialStart(start.date);
      }
      return;
    }
    own.accept(show(result.date));
    if (start.status === 'ok' && end.status === 'ok') {
      if (end.date < start.date) {
        // Reported on the input just edited, where focus still is.
        own.refuse(
          (index === 0
            ? translate('The start date must not be after the end date.')
            : translate(
                'The end date must not be before the start date.',
              )) as string,
          !!value,
        );
        emptyValue();
        return;
      }
      other.accept(show(index === 0 ? end.date : start.date));
      if (start.date.getTime() !== startMs || end.date.getTime() !== endMs) {
        onChange([start.date, end.date]);
      }
      if (draftStart) setPartialStart(undefined);
    } else if (start.status === 'ok' && end.status === 'empty') {
      setPartialStart(start.date);
    }
  };

  const handleClear = () => {
    startEntry.accept('');
    endEntry.accept('');
    if (draftStart) setPartialStart(undefined);
    onChange(undefined);
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

  const invalid = !!startEntry.error || !!endEntry.error || !!ariaInvalid;
  const inputProps = (
    entry: ReturnType<typeof useEntryText>,
    errorId: string,
    index: 0 | 1,
  ) => ({
    mask,
    value: entry.text,
    onValueChange: entry.type,
    dirty: entry.dirty,
    onCommit: commitEntry(index),
    onOpenCalendar: () => handleOpenChange(true),
    disabled,
    'aria-invalid': !!entry.error || !!ariaInvalid || undefined,
    'aria-describedby': joinIds(
      entry.error && errorId,
      hintId,
      ariaDescribedBy,
    ),
  });

  const startLabel = (
    enableTime ? translate('Start date and time') : translate('Start date')
  ) as string;
  const endLabel = (
    enableTime ? translate('End date and time') : translate('End date')
  ) as string;

  return (
    <DatePickerPopover
      open={open}
      onOpenChange={handleOpenChange}
      group={{
        'aria-labelledby': ariaLabelledBy,
        'aria-label': ariaLabelledBy
          ? undefined
          : (ariaLabel ?? placeholder ?? (translate('Date range') as string)),
      }}
      inputs={
        <>
          <DateEntryInput
            id={id}
            aria-label={startLabel}
            placeholder={formatPlaceholder(mask)}
            {...inputProps(startEntry, startErrorId, 0)}
          />
          <span aria-hidden className="shrink-0 text-quinary">
            –
          </span>
          <DateEntryInput
            aria-label={endLabel}
            placeholder={formatPlaceholder(mask)}
            {...inputProps(endEntry, endErrorId, 1)}
          />
        </>
      }
      hint={formatHint(mask)}
      hintId={hintId}
      errors={[
        ...(startEntry.error
          ? [{ id: startErrorId, message: startEntry.error }]
          : []),
        ...(endEntry.error
          ? [{ id: endErrorId, message: endEntry.error }]
          : []),
      ]}
      invalid={invalid}
      disabled={disabled}
      solid={solid}
      size={size}
      showClear={!!(startEntry.text || endEntry.text)}
      onClear={clearable ? handleClear : undefined}
      triggerLabel={translate('Choose date range') as string}
      dialogLabel={translate('Choose date range') as string}
      onBlur={onClose}
      style={style}
    >
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
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
          <span className="text-quinary">–</span>
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
