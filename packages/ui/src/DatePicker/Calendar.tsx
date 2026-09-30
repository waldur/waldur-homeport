import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { ComponentProps, useEffect, useRef } from 'react';
import {
  Day,
  DayButton,
  DayPicker,
  getDefaultClassNames,
  useDayPicker,
} from 'react-day-picker';

import { cn } from '../cn';

/**
 * shadcn's Calendar recipe (https://ui.shadcn.com/docs/components/calendar)
 * over react-day-picker, styled to match the Metronic theme: a 328px panel
 * of 40px cells (px rather than rem: Metronic's root font is 13px), round 39px days, a filled grey "today", brand-600 selected
 * days and a brand-50 band behind ranges, six rows per month.
 *
 * The colours are that stylesheet's semantic tokens resolved to runtime
 * variables — the Bootstrap gray ramp (swapped per theme stylesheet) and
 * the brand ramp — with the dark-mode picks it made via `isDarkMode()`
 * expressed as `dark:` variants.
 *
 * Behaviour the form fields rely on:
 * - The root carries `data-slot="calendar"`, and every day cell keeps
 *   react-day-picker's own `data-day`/`data-disabled`/`data-selected`
 *   attributes — the date-picker story driver reads those. Unlike shadcn's
 *   recipe, the day *button* deliberately does not get a `data-day` of its
 *   own (shadcn sets a locale string there, which would shadow the cell's
 *   ISO date for any `[data-day]` lookup).
 * - Default class names (`rdp-*`) are kept alongside the utilities so the
 *   navigation buttons and range states stay addressable.
 */
export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  fixedWeeks = true,
  components,
  formatters,
  ...props
}: ComponentProps<typeof DayPicker>) {
  const defaults = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      fixedWeeks={fixedWeeks}
      className={cn(
        'px-[24px] py-[20px] text-[14px] [--cell-size:40px]',
        '[--calendar-band:var(--waldur-brand-50)] dark:[--calendar-band:var(--waldur-brand-400)]',
        textSecondary,
        className,
      )}
      classNames={{
        root: cn('w-fit', defaults.root),
        months: cn(
          'relative flex flex-col gap-[24px] md:flex-row',
          defaults.months,
        ),
        month: cn('flex flex-col', defaults.month),
        nav: cn(
          'absolute inset-x-0 top-0 flex h-[40px] items-center justify-between',
          defaults.nav,
        ),
        button_previous: cn(navButton, defaults.button_previous),
        button_next: cn(navButton, defaults.button_next),
        month_caption: cn(
          'mb-[12px] flex h-[40px] items-center justify-center',
          defaults.month_caption,
        ),
        caption_label: cn(
          'text-[16px] font-medium select-none',
          defaults.caption_label,
        ),
        month_grid: cn('border-collapse', defaults.month_grid),
        weekdays: cn('flex h-[40px] items-center', defaults.weekdays),
        weekday: cn(
          // Clipped as a last resort; weekdayFormat keeps names short.
          'w-(--cell-size) overflow-hidden text-center text-[13px] font-medium text-ellipsis whitespace-nowrap select-none',
          defaults.weekday,
        ),
        week: cn('mt-[4px] flex', defaults.week),
        day: cn(
          'relative size-(--cell-size) p-0 text-center select-none',
          defaults.day,
        ),
        // The band behind a range: full cells in the middle (rounded where a
        // row breaks it), half cells under the round start and end.
        range_middle: cn(
          'bg-(--calendar-band) first:rounded-s-full last:rounded-e-full',
          '[&>button]:font-medium [&>button]:text-[var(--bs-gray-900)]',
          defaults.range_middle,
        ),
        range_start: cn(
          'bg-[linear-gradient(to_right,transparent_50%,var(--calendar-band)_50%)]',
          'last:bg-none [&.rdp-range_end]:bg-none',
          defaults.range_start,
        ),
        range_end: cn(
          'bg-[linear-gradient(to_left,transparent_50%,var(--calendar-band)_50%)]',
          'first:bg-none [&.rdp-range_start]:bg-none',
          defaults.range_end,
        ),
        today: cn(
          '[&>button]:bg-[var(--bs-gray-200)] [&>button]:font-medium',
          defaults.today,
        ),
        outside: cn('text-[var(--bs-gray-500)]', defaults.outside),
        disabled: cn(disabledText, defaults.disabled),
        // Days before startMonth/after endMonth: react-day-picker renders
        // nothing for them; CalendarDay below shows them as disabled.
        hidden: cn(disabledText, defaults.hidden),
        ...classNames,
      }}
      formatters={{
        formatWeekdayName: (date, options, dateLib) =>
          dateLib.format(date, weekdayFormat(dateLib, options), options),
        ...formatters,
      }}
      components={{
        Root: ({ className, rootRef, ...rootProps }) => (
          <div
            data-slot="calendar"
            ref={rootRef}
            className={className}
            {...rootProps}
          />
        ),
        Chevron: ({ className, orientation }) =>
          orientation === 'left' ? (
            <CaretLeftIcon className={cn('size-4', className)} weight="bold" />
          ) : (
            <CaretRightIcon className={cn('size-4', className)} weight="bold" />
          ),
        Day: CalendarDay,
        DayButton: CalendarDayButton,
        ...components,
      }}
      {...props}
    />
  );
}

type DateLib = Parameters<
  NonNullable<
    ComponentProps<typeof DayPicker>['formatters']
  >['formatWeekdayName']
>[2];
type DateLibOptions = Parameters<
  NonNullable<
    ComponentProps<typeof DayPicker>['formatters']
  >['formatWeekdayName']
>[1];

// Longest weekday header, in characters, that fits a 40px column.
const MAX_WEEKDAY_CHARS = 4;
const weekdayFormats = new Map<unknown, string>();

/**
 * The weekday header format for a locale: "Mon"-style (`EEE`)
 * where that fits, else date-fns's short (`EEEEEE`) or
 * narrow (`EEEEE`) names. `EEE` is far too long in several of the app's
 * languages — Estonian "esmasp.", Latvian "ceturtd.", Finnish "torst." —
 * and overlapped in the 40px columns. The header's aria-label keeps the
 * full name either way. Worked out once per locale.
 */
function weekdayFormat(dateLib: DateLib, options: DateLibOptions): string {
  const key = options?.locale ?? 'default';
  const cached = weekdayFormats.get(key);
  if (cached) return cached;
  // Any Monday–Sunday run will do.
  const week = Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 1 + i));
  const fits = (pattern: string) =>
    week.every(
      (day) =>
        [...dateLib.format(day, pattern, options)].length <= MAX_WEEKDAY_CHARS,
    );
  const pattern = ['EEE', 'EEEEEE'].find(fits) ?? 'EEEEE';
  weekdayFormats.set(key, pattern);
  return pattern;
}

const textSecondary =
  'text-[var(--bs-gray-700)] dark:text-[var(--bs-gray-600)]';
const disabledText = 'text-[var(--bs-gray-300)] dark:text-[var(--bs-gray-400)]';

const dayShape =
  'mx-auto flex size-[39px] items-center justify-center rounded-full leading-none';

const navButton = cn(
  'inline-flex size-[40px] items-center justify-center p-0 select-none',
  'hover:text-[var(--waldur-brand-600)]',
  'focus-visible:[outline:2px_solid_var(--focus-ring-color)]',
  // Hide the navigation arrow past minDate/maxDate rather than dimming it.
  'disabled:invisible aria-disabled:invisible',
);

/**
 * react-day-picker renders an empty cell for an outside day beyond the
 * navigable months (e.g. 31 Aug when `startMonth` is September); keep
 * the number here, inert — unless outside days are turned off altogether.
 */
function CalendarDay({
  day,
  modifiers,
  children,
  ...props
}: ComponentProps<typeof Day>) {
  const { dayPickerProps } = useDayPicker();
  const showInert =
    modifiers.hidden && day.outside && dayPickerProps.showOutsideDays;
  return (
    <td {...props}>
      {showInert ? (
        <span className={cn(dayShape, disabledText)}>{day.date.getDate()}</span>
      ) : (
        children
      )}
    </td>
  );
}

function CalendarDayButton({
  className,
  // Not forwarded: `day` is react-day-picker data, not a DOM attribute.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  day: _day,
  modifiers,
  ...props
}: ComponentProps<typeof DayButton>) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  const edge =
    (modifiers.selected && !modifiers.range_middle) ||
    modifiers.range_start ||
    modifiers.range_end;

  return (
    <button
      ref={ref}
      type="button"
      data-edge={edge || undefined}
      className={cn(
        dayShape,
        'hover:bg-(--calendar-band) hover:font-medium hover:text-[var(--bs-gray-900)]',
        'disabled:pointer-events-none',
        'focus-visible:relative focus-visible:z-10 focus-visible:[outline:2px_solid_var(--focus-ring-color)]',
        'data-[edge]:bg-[var(--waldur-brand-600)] data-[edge]:font-medium data-[edge]:text-white',
        'dark:data-[edge]:bg-[var(--waldur-brand-400)] dark:data-[edge]:text-[var(--bs-gray-900)]',
        className,
      )}
      {...props}
    />
  );
}
