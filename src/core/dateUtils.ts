import { DateTime, ToRelativeUnit } from 'luxon';

import { getDateLocale } from 'waldur-i18n-runtime';

export type DateInput =
  DateTime | Date | string | number | number[] | null | undefined;

type DateFormatter = (date: DateInput) => string;

/** What a formatter shows for a missing or unparseable date: a dash, never
 *  a plausible-looking date. Same character as the table's empty cell. */
const MISSING_DATE = '\u2014';

/**
 * A DateTime for any date-like value. `null`/`undefined` give an *invalid*
 * DateTime, not the current time: a missing `end_date` used to render as
 * today, which reads as real data. Pass `DateTime.now()` when you mean now.
 */
export const parseDate = (value: DateInput): DateTime => {
  if (value instanceof DateTime) {
    return value;
  } else if (typeof value === 'undefined' || value === null) {
    return DateTime.invalid('missing date');
  } else if (typeof value === 'string') {
    // Parse ISO string while preserving original timezone info
    // If no timezone is specified, use local timezone as fallback
    const parsed = DateTime.fromISO(value);
    return parsed.isValid
      ? parsed
      : DateTime.fromISO(value, { zone: DateTime.local().zone });
  } else if (value instanceof Date) {
    return DateTime.fromJSDate(value);
  } else if (typeof value === 'number') {
    return DateTime.fromMillis(value);
  } else if (Array.isArray(value)) {
    return DateTime.fromObject({
      year: value[0],
      month: value[1] + 1, // convert 0-based to 1-based
      day: value[2],
      hour: value[3],
      minute: value[4],
      second: value[5],
      millisecond: value[6],
    });
  }
  return DateTime.invalid('unsupported date input');
};

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Whether a value is a calendar date (`2026-09-10`) rather than an instant. */
const isCalendarDate = (value: DateInput): value is string =>
  typeof value === 'string' && DATE_ONLY_PATTERN.test(value);

/**
 * A calendar date: start of that day in the local zone. A timestamp keeps
 * the date it names in its own offset, so `2026-09-30T00:00:00Z` is 30 Sep
 * everywhere, rather than 29 Sep west of UTC as a local conversion makes it.
 * Use it for values that are days (end dates, due dates), not instants.
 */
export const parseCalendarDate = (value: DateInput): DateTime => {
  const parsed =
    typeof value === 'string'
      ? DateTime.fromISO(value, { setZone: true })
      : parseDate(value);
  if (!parsed.isValid) {
    return parsed;
  }
  return DateTime.local(parsed.year, parsed.month, parsed.day);
};

/* ── Display formatting ──────────────────────────────────────────────────────
 *
 * Every display format is an Intl preset rendered in the date locale
 * (`getDateLocale()`: the UI language, with plain English as en-GB so dates
 * read day-first). Never a Luxon token string such as 'd LLL yyyy': no token
 * string is right in every locale — LLL is a bare number in Lithuanian and the
 * wrong case in Russian, MMMM without a day is the wrong case in Finnish and
 * every Slavic language. The locale's own pattern gets all of that right.
 * Token strings are for machine formats only (yyyy-MM, ISO), and the
 * `waldur/no-display-date-tokens` lint rule keeps them that way.
 */
const display = (
  date: DateInput,
  preset: Intl.DateTimeFormatOptions,
): string => {
  const parsed = parseDate(date);
  return parsed.isValid
    ? parsed.toLocaleString(preset, { locale: getDateLocale() })
    : MISSING_DATE;
};

/** @example 2027-02-26 */
export const formatISODate: DateFormatter = (date) =>
  parseDate(date).toISODate();

/** @example 26 Feb 2027 (en), 26 февр. 2027 г. (ru), 26.2.2027 (fi) */
export const formatDate: DateFormatter = (date) =>
  display(date, DateTime.DATE_MED);

/** @example 26 February 2027 */
export const formatLongDate: DateFormatter = (date) =>
  display(date, DateTime.DATE_FULL);

/** @example 26 Feb 2027, 14:00 */
export const formatDateTime: DateFormatter = (date) =>
  display(date, DateTime.DATETIME_MED);

/** @example 26 Feb 2027, 14:00:05 — for event logs where seconds matter */
export const formatDateTimeWithSeconds: DateFormatter = (date) =>
  display(date, DateTime.DATETIME_MED_WITH_SECONDS);

/** @example 14:21 */
export const formatTime: DateFormatter = (date) =>
  display(date, DateTime.TIME_SIMPLE);

/** @example 26 Feb */
export const formatDayMonth: DateFormatter = (date) =>
  display(date, { day: 'numeric', month: 'short' });

/** @example 26 Feb, 14:00 */
export const formatDayMonthTime: DateFormatter = (date) =>
  display(date, {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });

/** @example July 2022 */
export const formatMonth: DateFormatter = (date) =>
  display(date, { month: 'long', year: 'numeric' });

/** @example Jul 2022 */
export const formatShortMonth: DateFormatter = (date) =>
  display(date, { month: 'short', year: 'numeric' });

/** @example July */
export const formatMonthName: DateFormatter = (date) =>
  display(date, { month: 'long' });

/** @example 22 July 2024 at 14:00 EET */
export const formatMediumDateTime: DateFormatter = (date) =>
  display(date, { ...DateTime.DATETIME_FULL, timeZoneName: 'short' });

/** @example 22 Jul 2024, 14:00 */
export const formatShortDateTime: DateFormatter = formatDateTime;

/** @example 2024-07-22T14:00 */
export const formatISOWithoutZone: DateFormatter = (date) =>
  parseDate(date).toFormat("yyyy-MM-dd'T'HH:mm");

// Luxon picks the display unit (years/months/days/...) from the un-rounded
// diff, then rounds the number within that unit. That means a value like
// 11.8 months (raw years diff 0.98, below the years bucket's own >=1
// threshold) never crosses into "years" — it prints "in 12 months" instead
// of "in 1 year". After Luxon picks a bucket, check whether the rounded
// count reaches that unit's exact conversion into the next one up and, if
// so, carry it over — the same rollover you'd want when rounding 59.6
// seconds to "1 minute" rather than "60 seconds".
const RELATIVE_UNITS: ToRelativeUnit[] = [
  'years',
  'months',
  'days',
  'hours',
  'minutes',
  'seconds',
];

const CARRY_THRESHOLDS: Partial<
  Record<ToRelativeUnit, [ToRelativeUnit, number]>
> = {
  months: ['years', 12],
  hours: ['days', 24],
  minutes: ['hours', 60],
  seconds: ['minutes', 60],
};

/** A calendar date carries no time, so `2026-09-10` is the whole of that day
 *  rather than the instant it begins. Measuring it from the current *instant*
 *  loses most of today: a date nine days out reads as "in 8 days" for all but
 *  the first moments of the morning. Whole days are therefore measured between
 *  start-of-day and start-of-day, and only sub-day units are dropped with them
 *  — a date has no hours to report. Timestamps keep instant precision. */
const WHOLE_DAY_UNITS: ToRelativeUnit[] = ['years', 'months', 'days'];

export const formatRelative: DateFormatter = (date) => {
  const isWholeDay = isCalendarDate(date);
  const target = isWholeDay ? parseCalendarDate(date) : parseDate(date);
  if (!target.isValid) {
    return MISSING_DATE;
  }
  const now = isWholeDay
    ? DateTime.fromObject({}, { zone: target.zone }).startOf('day')
    : DateTime.fromObject({}, { zone: target.zone });
  const units = isWholeDay ? WHOLE_DAY_UNITS : RELATIVE_UNITS;

  for (const [index, unit] of units.entries()) {
    const rawCount = target.diff(now, unit).get(unit);
    const isLastUnit = index === units.length - 1;

    if (Math.abs(rawCount) >= 1 || isLastUnit) {
      const carry = CARRY_THRESHOLDS[unit];
      const crossesIntoNextUnit =
        carry && Math.abs(Math.round(rawCount)) >= carry[1];
      const displayUnit = crossesIntoNextUnit ? carry[0] : unit;

      // A whole day that rounds to zero is today, and "in 0 days" is worse
      // than the hours count it replaced. `toRelativeCalendar` is the call that
      // words it — `toRelative` has no `numeric` option to pass through, it
      // always formats numerically. Only this case uses it: applying it
      // generally would render every "in 1 day" as "tomorrow" across the app.
      if (isWholeDay && displayUnit === 'days' && Math.round(rawCount) === 0) {
        return target.toRelativeCalendar({ base: now, unit: 'days' });
      }
      // `base` matters as much as the loop above: without it Luxon measures
      // from the real current instant, so the unit would be chosen from one
      // reference and the number rendered from another.
      return target.toRelative({
        base: now,
        unit: displayUnit,
        rounding: 'round',
      });
    }
  }

  return target.toRelative({ base: now, rounding: 'round' });
};

/* ── End dates are exclusive ──────────────────────────────────────────────────
 *
 * Waldur ends access *at* an end date, not after it: Project.is_expired is
 * `effective_end_date <= today`, so on the date itself the project is already
 * over and the resources are gone. The last day anyone can actually use it is
 * therefore the day before.
 *
 * Users read "ends 30 Sep" as "I have until the 30th" and lose a day of work
 * to it, so anything counting down to an end date counts to the last usable
 * day instead, and any sentence phrased as "active until" names that day
 * rather than the end date.
 */

/** The last day access is available for an (exclusive) end date. */
export const lastAccessDate = (endDate: DateInput): DateTime =>
  parseCalendarDate(endDate).minus({ days: 1 });

/**
 * Whole days from today to the last day of access.
 * 0 means today is the last day; negative means access has already ended.
 */
export const daysUntilAccessEnds = (endDate: DateInput): number =>
  Math.round(
    lastAccessDate(endDate).diff(DateTime.now().startOf('day'), 'days').days,
  );

// Intl formatters are costly to build and these run per table cell, so one
// is kept per locale and option set.
const intlCache = new Map<string, Intl.NumberFormat | Intl.ListFormat>();

const cachedIntl = <T extends Intl.NumberFormat | Intl.ListFormat>(
  key: string,
  build: () => T,
): T => {
  let formatter = intlCache.get(key) as T | undefined;
  if (!formatter) {
    formatter = build();
    intlCache.set(key, formatter);
  }
  return formatter;
};

/** Whole units of a duration, largest first, in the date locale: "3 hours,
 *  5 minutes" (long) or "2d 3h" (narrow). Zero units are left out; an empty
 *  duration reads as zero of the smallest unit. */
const formatDurationUnits = (
  parts: [Intl.NumberFormatOptions['unit'], number][],
  unitDisplay: 'long' | 'narrow',
): string => {
  const locale = getDateLocale();
  const shown = parts.filter(([, value]) => value > 0);
  const units = shown.length ? shown : parts.slice(-1);
  const style = unitDisplay === 'narrow' ? 'narrow' : 'short';
  const list = cachedIntl(
    `list:${locale}:${style}`,
    () => new Intl.ListFormat(locale, { type: 'unit', style }),
  );
  return list.format(
    units.map(([unit, value]) =>
      cachedIntl(
        `unit:${locale}:${unit}:${unitDisplay}`,
        () =>
          new Intl.NumberFormat(locale, { style: 'unit', unit, unitDisplay }),
      ).format(value),
    ),
  );
};

/** Time left until a date: hours and minutes within a day, relative beyond.
 *  A date already past reads as relative ("3 hours ago"), never as a
 *  countdown clamped to zero. */
export const formatRelativeWithHour: DateFormatter = (date) => {
  const target = parseDate(date);
  if (!target.isValid) {
    return MISSING_DATE;
  }
  const dateDiff = target.diffNow(['hours', 'minutes']);
  if (dateDiff.toMillis() < 0) {
    return formatRelative(target);
  }

  if (dateDiff.hours > 24) {
    return target.toRelative({ locale: getDateLocale() });
  }
  return formatDurationUnits(
    [
      ['hour', Math.floor(dateDiff.hours)],
      ['minute', Math.floor(dateDiff.minutes)],
    ],
    'long',
  );
};

/** How long since a start time, compactly: "2d 3h", "4h 10m", "5m". */
export const formatUptime = (date: DateInput): string => {
  const start = parseDate(date);
  if (!start.isValid) {
    return MISSING_DATE;
  }
  const diff = DateTime.now()
    .diff(start, ['days', 'hours', 'minutes'])
    .toObject();

  const days = Math.floor(diff.days || 0);
  const hours = Math.floor(diff.hours || 0);
  const minutes = Math.floor(diff.minutes || 0);

  if (days > 1000) {
    return formatDurationUnits([['day', days]], 'narrow');
  } else if (days > 0) {
    return formatDurationUnits(
      [
        ['day', days],
        ['hour', hours],
      ],
      'narrow',
    );
  }
  return formatDurationUnits(
    [
      ['hour', hours],
      ['minute', minutes],
    ],
    'narrow',
  );
};
