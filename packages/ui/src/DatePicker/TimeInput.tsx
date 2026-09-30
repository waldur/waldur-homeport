import { DateTime } from 'luxon';
import { FC, KeyboardEvent, useState } from 'react';
import { translate } from 'waldur-i18n-runtime';

import { cn } from '../cn';

import { DEFAULT_TIME } from './dateBounds';

interface TimeInputProps {
  /** Its time of day is shown; `undefined` shows the 12:00 default. */
  value?: DateTime;
  onChange(time: { hour: number; minute: number }): void;
  /** Accessible name of the group — "Time", "Start time" or "End time". */
  label: string;
  disabled?: boolean;
  /** Minutes the arrow keys move the minute by. Defaults to 1. */
  minuteStep?: number;
}

/**
 * The calendar popup's time of day: a large, centred
 * `HH : mm` of two borderless fields, the hour bold. Always 24-hour, to
 * match the `yyyy-MM-dd HH:mm` the trigger shows — a native
 * `<input type="time">` follows the browser's locale instead (AM/PM in
 * en-US), and brings a picker button that can't be themed.
 *
 * Type a number and press Enter or move on, or use the arrow keys.
 */
export const TimeInput: FC<TimeInputProps> = ({
  value,
  onChange,
  label,
  disabled,
  minuteStep = 1,
}) => {
  const hour = value?.hour ?? DEFAULT_TIME.hour;
  const minute = value?.minute ?? DEFAULT_TIME.minute;
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        'flex items-center justify-center gap-[2px] text-[16px] text-[var(--surface-text-primary)]',
        disabled && 'text-[var(--surface-text-muted)]',
      )}
    >
      <TimeSegment
        label={translate('Hour')}
        value={hour}
        max={23}
        step={1}
        disabled={disabled}
        onCommit={(next) => onChange({ hour: next, minute })}
        className="font-semibold"
      />
      <span aria-hidden className="px-[2px] font-semibold">
        :
      </span>
      <TimeSegment
        label={translate('Minute')}
        value={minute}
        max={59}
        step={minuteStep}
        disabled={disabled}
        onCommit={(next) => onChange({ hour, minute: next })}
      />
    </div>
  );
};

interface TimeSegmentProps {
  label: string;
  value: number;
  max: number;
  /** How far one arrow-key press moves the value. */
  step: number;
  disabled?: boolean;
  onCommit(value: number): void;
  className?: string;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** One two-digit field; the typed text is a draft until it is committed. */
const TimeSegment: FC<TimeSegmentProps> = ({
  label,
  value,
  max,
  step,
  disabled,
  onCommit,
  className,
}) => {
  const [draft, setDraft] = useState<string | null>(null);

  const commit = () => {
    if (draft === null) return;
    const parsed = Number(draft);
    setDraft(null);
    if (
      draft !== '' &&
      Number.isInteger(parsed) &&
      parsed >= 0 &&
      parsed <= max
    ) {
      onCommit(parsed);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      // Commit without submitting a surrounding form.
      event.preventDefault();
      commit();
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      const delta = event.key === 'ArrowUp' ? step : -step;
      setDraft(null);
      onCommit((value + delta + max + 1) % (max + 1));
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      aria-label={label}
      maxLength={2}
      disabled={disabled}
      value={draft ?? pad(value)}
      onChange={(event) => setDraft(event.target.value.replace(/\D/g, ''))}
      onFocus={(event) => event.target.select()}
      onBlur={commit}
      onKeyDown={handleKeyDown}
      className={cn(
        'w-[2.5em] rounded-[6px] bg-transparent py-[6px] text-center tabular-nums outline-none',
        'hover:bg-[var(--surface-hover-bg)] focus:bg-[var(--surface-hover-bg)]',
        'focus-visible:[outline:2px_solid_var(--focus-ring-color)]',
        'disabled:cursor-not-allowed disabled:hover:bg-transparent',
        className,
      )}
    />
  );
};
