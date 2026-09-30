import { DateTime } from 'luxon';
import { CSSProperties, FC } from 'react';
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
import { DatePickerPopover, usePickerOpenState } from './DatePickerPopover';
import { TimeInput } from './TimeInput';
import { useCalendarLocale } from './useCalendarLocale';

/** The strip under the calendar holding the time inputs, centred. */
export const timeRowClassName =
  'flex items-center justify-center gap-[16px] border-t-[1px] border-solid border-[var(--surface-card-border)] px-[16px] py-[8px]';

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
  placeholder?: string;
  disabled?: boolean;
  solid?: boolean;
  size?: 'sm';
  /** Offer a remove button while there is a value. Defaults to true. */
  clearable?: boolean;
  /** Called when the popup closes — the field's blur. */
  onClose?(): void;
  /** Open the popup as soon as the picker mounts (table filters). */
  autoOpen?: boolean;
  id?: string;
  style?: CSSProperties;
}

/**
 * Single date (optionally with time) in a popup calendar. Plain value in,
 * plain value out — the app's react-final-form adapters are DateField and
 * DateTimeField (src/form).
 */
export const DatePicker: FC<DatePickerProps> = ({
  value,
  onChange,
  enableTime,
  minDate,
  maxDate,
  enable,
  inline,
  placeholder,
  disabled,
  solid,
  size,
  clearable = true,
  onClose,
  autoOpen,
  id,
  style,
}) => {
  const [open, setOpen] = usePickerOpenState(autoOpen);
  const locale = useCalendarLocale();
  const current = value ? DateTime.fromJSDate(value) : undefined;

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
        className="inline-block rounded-[8px] border-[1px] border-solid border-[var(--surface-card-border)]"
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
      displayValue={current?.toFormat(
        enableTime ? DATE_TIME_FORMAT : DATE_FORMAT,
      )}
      placeholder={placeholder}
      disabled={disabled}
      solid={solid}
      size={size}
      onClear={clearable ? () => onChange(null) : undefined}
      id={id}
      style={style}
    >
      {body}
    </DatePickerPopover>
  );
};
