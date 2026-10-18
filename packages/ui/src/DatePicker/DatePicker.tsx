import { DateTime } from 'luxon';
import { ComponentProps, CSSProperties, FC, useId } from 'react';
import { translate } from 'waldur-i18n-runtime';

import { useControlId, useDescribedBy } from '../Form/controlId';

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
import {
  DateEntryInput,
  DatePickerPopover,
  commitSingleEntry,
  formatHint,
  formatPlaceholder,
  joinIds,
  useEntryText,
  usePickerOpenState,
  useReportEntryError,
} from './DatePickerPopover';
import { TimeInput } from './TimeInput';
import { useCalendarLocale } from './useCalendarLocale';

/** The strip under the calendar holding the time inputs, centred. */
export const timeRowClassName =
  'flex items-center justify-center gap-[16px] border-t-[1px] border-solid border-secondary px-[16px] py-[8px]';

export interface DatePickerProps {
  value: Date | null | undefined;
  onChange(value: Date | null): void;
  /** Adds a time-of-day input; the popup then stays open after a day pick. */
  enableTime?: boolean;
  /** Inclusive, day-granular in the calendar; exact once a time is set. */
  minDate?: DateBound;
  maxDate?: DateBound;
  /** When given, only days matching at least one predicate are selectable. */
  enable?: Array<(date: Date) => boolean>;
  /** Render the calendar in place, always visible, instead of in a popup. */
  inline?: boolean;
  /**
   * `'dropdown'` puts month and year dropdowns in the caption, for dates
   * far from today (a birth date); `'dropdown-months'`/`'dropdown-years'`
   * show just one. Years span `minDate`–`maxDate`, else the last 100 years.
   */
  captionLayout?: ComponentProps<typeof Calendar>['captionLayout'];
  placeholder?: string;
  disabled?: boolean;
  solid?: boolean;
  size?: 'sm';
  /** Offer a remove button while there is a value. Defaults to true. */
  clearable?: boolean;
  /** The field's blur: the popup closed, or focus left the input. */
  onClose?(): void;
  /** Open the popup as soon as the picker mounts (table filters). */
  autoOpen?: boolean;
  /** On the text input, so a `<label for>` names it. */
  id?: string;
  /** The form's error state; a refused entry sets it by itself. */
  'aria-invalid'?: boolean;
  /** Called with the message of a refused entry, or `null` once there is none. */
  onEntryErrorChange?(message: string | null): void;
  /** More descriptions (the form's description and error) for the input. */
  'aria-describedby'?: string;
  style?: CSSProperties;
}

/**
 * Single date (optionally with time): typed into a masked text input
 * (`yyyy-MM-dd`, or `yyyy-MM-dd HH:mm`), or picked in a popup calendar
 * behind the button beside it. A date typed or pasted in the browser
 * locale's own order (`15.06.2026` in Estonia, `6/15/2026` in the US) is
 * accepted too and shown in ISO. Plain value in, plain value out — the app's
 * react-final-form adapters are DateField and DateTimeField (src/form).
 *
 * A typed entry is committed on Enter or blur, against the same rules as
 * the calendar (bounds, `enable`). One that is not a date, or not an
 * allowed one, stays in the input and is reported (`aria-invalid` and a
 * message) and the value is emptied — never adjusted to something the user
 * did not type. A bare date typed with `enableTime` gets the time a
 * calendar pick would.
 */
export const DatePicker: FC<DatePickerProps> = ({
  value,
  onChange,
  enableTime,
  minDate,
  maxDate,
  enable,
  inline,
  captionLayout,
  placeholder,
  disabled,
  solid,
  size,
  clearable = true,
  onClose,
  autoOpen,
  id: idProp,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
  onEntryErrorChange,
  style,
}) => {
  const id = useControlId(idProp);
  // The field's help and error text, besides any given by hand.
  const describedBy = useDescribedBy(ariaDescribedBy);
  const [open, setOpen] = usePickerOpenState(autoOpen);
  const locale = useCalendarLocale();
  const current = value ? DateTime.fromJSDate(value) : undefined;
  const format = enableTime ? DATE_TIME_FORMAT : DATE_FORMAT;
  const entry = useEntryText(current?.toFormat(format) ?? '');
  const baseId = useId();
  const hintId = `${baseId}-hint`;
  const errorId = `${baseId}-error`;
  useReportEntryError(entry.error, onEntryErrorChange);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) onClose?.();
  };

  const commit = (next: DateTime) =>
    onChange(clampToBounds(next, minDate, maxDate).toJSDate());

  const handleDaySelect = (day: Date | undefined) => {
    if (!day) return;
    if (enableTime) {
      // Keep the time already chosen; a first pick starts at noon.
      commit(
        withTime(
          day,
          current
            ? { hour: current.hour, minute: current.minute }
            : DEFAULT_TIME,
        ),
      );
    } else {
      onChange(DateTime.fromJSDate(day).startOf('day').toJSDate());
      handleOpenChange(false);
    }
  };

  const commitEntry = () =>
    commitSingleEntry({
      entry,
      result: validateEntry(entry.text, enableTime ? 'datetime' : 'date', {
        minDate,
        maxDate,
        enable,
      }),
      value,
      onChange,
      format,
      resolve: ({ value: typed, hasTime }) =>
        !enableTime
          ? typed.startOf('day')
          : clampToBounds(
              hasTime
                ? typed
                : withTime(
                    typed.toJSDate(),
                    current
                      ? { hour: current.hour, minute: current.minute }
                      : DEFAULT_TIME,
                  ),
              minDate,
              maxDate,
            ),
    });

  const handleTimeChange = (time: { hour: number; minute: number }) => {
    if (!value) return;
    commit(withTime(value, time));
  };

  const disabledDays = boundsToDisabled(minDate, maxDate);
  if (enable?.length) {
    disabledDays.push((date: Date) => !enable.some((match) => match(date)));
  }

  const body = (
    <>
      <Calendar
        mode="single"
        required
        autoFocus={!inline}
        selected={value ?? undefined}
        onSelect={handleDaySelect}
        defaultMonth={value ?? undefined}
        weekStartsOn={1}
        locale={locale}
        captionLayout={captionLayout}
        disabled={disabled ? true : disabledDays}
        {...boundsToMonths(minDate, maxDate)}
      />
      {enableTime ? (
        <div className={timeRowClassName}>
          <TimeInput
            label={translate('Time')}
            value={current}
            onChange={handleTimeChange}
            disabled={disabled || !value}
          />
        </div>
      ) : null}
    </>
  );

  if (inline) {
    return (
      <div
        id={id}
        className="inline-block rounded-lg border-[1px] border-solid border-secondary"
        style={style}
      >
        {body}
      </div>
    );
  }

  return (
    <DatePickerPopover
      open={open}
      onOpenChange={handleOpenChange}
      inputs={
        <DateEntryInput
          id={id}
          mask={enableTime ? 'datetime' : 'date'}
          value={entry.text}
          onValueChange={entry.type}
          dirty={entry.dirty}
          onCommit={commitEntry}
          onOpenCalendar={() => handleOpenChange(true)}
          placeholder={
            placeholder ?? formatPlaceholder(enableTime ? 'datetime' : 'date')
          }
          disabled={disabled}
          aria-invalid={!!entry.error || !!ariaInvalid || undefined}
          aria-describedby={joinIds(
            entry.error && errorId,
            hintId,
            describedBy,
          )}
        />
      }
      hint={formatHint(enableTime ? 'datetime' : 'date')}
      hintId={hintId}
      errors={entry.error ? [{ id: errorId, message: entry.error }] : []}
      invalid={!!entry.error || !!ariaInvalid}
      disabled={disabled}
      solid={solid}
      size={size}
      showClear={!!entry.text}
      onClear={
        clearable
          ? () => {
              entry.accept('');
              if (value) onChange(null);
            }
          : undefined
      }
      triggerLabel={translate('Choose date')}
      dialogLabel={
        (enableTime
          ? translate('Choose date and time')
          : translate('Choose date')) as string
      }
      onBlur={onClose}
      style={style}
    >
      {body}
    </DatePickerPopover>
  );
};
