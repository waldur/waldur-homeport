import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { DateTime } from 'luxon';
import { CSSProperties, FC, useId, useState } from 'react';
import { translate } from 'waldur-i18n-runtime';

import { cn } from '../cn';
import { useControlId, useDescribedBy } from '../Form/controlId';

import { DateBound, parseBound } from './dateBounds';
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
import { useCalendarLocale } from './useCalendarLocale';

export interface MonthPickerProps {
  /** Any day in the month; `null`/`undefined` is empty. */
  value: Date | null | undefined;
  /** Called with the first day of the picked month, or `null` when cleared. */
  onChange(value: Date | null): void;
  /** Month-granular and inclusive: the bound's whole month is selectable. */
  minDate?: DateBound;
  maxDate?: DateBound;
  placeholder?: string;
  disabled?: boolean;
  solid?: boolean;
  size?: 'sm';
  /** Offer a remove button while there is a value. Defaults to true. */
  clearable?: boolean;
  /** The field's blur: the popup closed, or focus left the input. */
  onClose?(): void;
  /** Open the popup as soon as the picker mounts. */
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

export const MONTH_FORMAT = 'yyyy-MM';

/**
 * A month (billing periods, usage ranges): typed as `yyyy-MM` into a masked
 * text input, or picked in a popup of the year with prev/next arrows over a
 * grid of the twelve months — the same input, popover and colours as
 * DatePicker, with the same handling of refused entries. Replaces `<input type="month">`, which
 * can't be styled, renders differently per browser, and isn't supported by
 * desktop Firefox at all (it degrades to a plain text box).
 */
export const MonthPicker: FC<MonthPickerProps> = ({
  value,
  onChange,
  minDate,
  maxDate,
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
  const current = value ? DateTime.fromJSDate(value).startOf('month') : null;
  const [year, setYear] = useState(() => (current ?? DateTime.now()).year);
  const locale = useCalendarLocale();
  const entry = useEntryText(current?.toFormat(MONTH_FORMAT) ?? '');
  const baseId = useId();
  const hintId = `${baseId}-hint`;
  const errorId = `${baseId}-error`;
  useReportEntryError(entry.error, onEntryErrorChange);

  const min = parseBound(minDate)?.startOf('month');
  const max = parseBound(maxDate)?.startOf('month');
  const isOutOfRange = (month: DateTime) =>
    (!!min && month < min) || (!!max && month > max);

  const handleOpenChange = (next: boolean) => {
    // Each opening starts on the value's year (or this year).
    if (next) setYear((current ?? DateTime.now()).year);
    setOpen(next);
    if (!next) onClose?.();
  };

  const pick = (month: DateTime) => {
    onChange(month.toJSDate());
    handleOpenChange(false);
  };

  const commitEntry = () =>
    commitSingleEntry({
      entry,
      result: validateEntry(entry.text, 'month', { minDate, maxDate }),
      // Compared as the month it stands for: any day in it is the same value.
      value: current?.toJSDate(),
      onChange,
      format: MONTH_FORMAT,
      resolve: ({ value: typed }) => typed.startOf('month'),
    });

  const thisMonth = DateTime.now().startOf('month');
  const months = Array.from({ length: 12 }, (_, i) =>
    DateTime.local(year, i + 1, 1),
  );

  return (
    <DatePickerPopover
      open={open}
      onOpenChange={handleOpenChange}
      inputs={
        <DateEntryInput
          id={id}
          mask="month"
          value={entry.text}
          onValueChange={entry.type}
          dirty={entry.dirty}
          onCommit={commitEntry}
          onOpenCalendar={() => handleOpenChange(true)}
          placeholder={placeholder ?? formatPlaceholder('month')}
          disabled={disabled}
          aria-invalid={!!entry.error || !!ariaInvalid || undefined}
          aria-describedby={joinIds(
            entry.error && errorId,
            hintId,
            describedBy,
          )}
        />
      }
      hint={formatHint('month')}
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
      triggerLabel={translate('Choose month') as string}
      dialogLabel={translate('Choose month') as string}
      onBlur={onClose}
      style={style}
    >
      <div
        data-slot="month-calendar"
        className="w-[328px] px-[24px] py-[20px] text-sm text-secondary"
      >
        <div className="mb-[12px] flex h-[40px] items-center justify-between">
          <button
            type="button"
            aria-label={translate('Previous year')}
            className={navButton}
            disabled={!!min && year <= min.year}
            onClick={() => setYear((y) => y - 1)}
          >
            <CaretLeftIcon className="size-4" weight="bold" />
          </button>
          <span
            data-slot="month-calendar-year"
            className="text-base font-medium select-none"
          >
            {year}
          </span>
          <button
            type="button"
            aria-label={translate('Next year')}
            className={navButton}
            disabled={!!max && year >= max.year}
            onClick={() => setYear((y) => y + 1)}
          >
            <CaretRightIcon className="size-4" weight="bold" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-y-[8px]">
          {months.map((month) => {
            const selected = !!current && month.equals(current);
            return (
              <button
                key={month.month}
                type="button"
                data-month={month.toFormat(MONTH_FORMAT)}
                data-selected={selected || undefined}
                aria-pressed={selected}
                aria-label={format(month.toJSDate(), 'LLLL yyyy', { locale })}
                disabled={isOutOfRange(month)}
                onClick={() => pick(month)}
                className={cn(
                  'mx-auto flex h-[39px] w-[80px] items-center justify-center rounded-full leading-none',
                  'hover:bg-brand-subtle hover:font-medium hover:text-primary',
                  'focus-visible:[outline:2px_solid_var(--focus-ring-color)]',
                  'disabled:pointer-events-none disabled:text-[var(--text-disabled)]',
                  month.equals(thisMonth) &&
                    !selected &&
                    'bg-quaternary font-medium',
                  // Keyed on data-selected, like Calendar's data-edge: the data
                  // variant outranks hover:, so a hovered selected month keeps
                  // its fill.
                  selected && 'font-medium',
                  'data-[selected]:bg-brand-600 data-[selected]:text-white',
                  'dark:data-[selected]:bg-brand-400 dark:data-[selected]:text-[var(--brand-on-400)]',
                )}
              >
                {format(month.toJSDate(), 'LLL', { locale })}
              </button>
            );
          })}
        </div>
      </div>
    </DatePickerPopover>
  );
};

const navButton = cn(
  'inline-flex size-[40px] items-center justify-center p-0 select-none',
  'hover:text-brand',
  'focus-visible:[outline:2px_solid_var(--focus-ring-color)]',
  // As in Calendar: hidden, not dimmed, past the bounds.
  'disabled:invisible',
);
