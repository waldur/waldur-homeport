import { DateTime } from 'luxon';

/**
 * The typed shapes a picker's text input accepts: a day, a day with a time
 * of day, or a month. Always ISO order, so what is typed is what is shown
 * and what a pasted ISO value already looks like.
 */
export type DateMask = 'date' | 'datetime' | 'month';

export const MASK_FORMATS: Record<DateMask, string> = {
  date: 'yyyy-MM-dd',
  datetime: 'yyyy-MM-dd HH:mm',
  month: 'yyyy-MM',
};

/** The format as shown to people, in the hint under the field. */
export const MASK_HINTS: Record<DateMask, string> = {
  date: 'YYYY-MM-DD',
  datetime: 'YYYY-MM-DD HH:MM',
  month: 'YYYY-MM',
};

/** Digits per segment, and the separator that follows each but the last. */
const SEGMENTS: Record<DateMask, Array<[number, string]>> = {
  date: [
    [4, '-'],
    [2, '-'],
    [2, ''],
  ],
  datetime: [
    [4, '-'],
    [2, '-'],
    [2, ' '],
    [2, ':'],
    [2, ''],
  ],
  month: [
    [4, '-'],
    [2, ''],
  ],
};

const maxDigits = (mask: DateMask) =>
  SEGMENTS[mask].reduce((sum, [n]) => sum + n, 0);

export const digitsOf = (text: string) => text.replace(/\D/g, '');

/** The order a locale writes a calendar date in. */
export type DateOrder = 'dmy' | 'mdy' | 'ymd';

export const dateOrderOf = (locale?: string): DateOrder => {
  const order = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .formatToParts(new Date(2026, 5, 15))
    .filter(({ type }) => type === 'day' || type === 'month' || type === 'year')
    .map(({ type }) => type[0])
    .join('');
  return order === 'dmy' || order === 'mdy' ? order : 'ymd';
};

/**
 * The order the user writes dates in, from the browser's locale rather
 * than the UI language: date order is regional, so someone in Estonia with
 * an English UI still writes 15.06.2026, and `en` alone can't tell en-GB
 * from en-US.
 */
export const browserDateOrder = (): DateOrder =>
  dateOrderOf(
    typeof navigator === 'undefined' ? undefined : navigator.language,
  );

/**
 * An entry in the locale's own order (`15.06.2026`, `6/15/2026`): one or
 * two digits, then a separator. An ISO entry starts with the four-digit
 * year, so the two never overlap.
 */
export const isRegionalEntry = (raw: string, order: DateOrder) =>
  order !== 'ymd' && /^\s*\d{1,2}[./-]/.test(raw);

const REGIONAL_DATE =
  /^(\d{1,2})([./-])(\d{1,2})\2(\d{4})(?:,?\s+(\d{1,2}):(\d{2}))?$/;
const REGIONAL_MONTH = /^(\d{1,2})[./-](\d{4})$/;

/**
 * Reads a complete entry in the locale's order: day and month as the locale
 * puts them, a four-digit year, and — for a time mask — an optional
 * `HH:mm`. A time pasted into a date-only field is dropped.
 */
const parseRegional = (
  text: string,
  mask: DateMask,
  order: DateOrder,
): { value: DateTime; hasTime: boolean } | undefined => {
  if (order === 'ymd') return undefined;
  const trimmed = text.trim();
  if (mask === 'month') {
    const match = REGIONAL_MONTH.exec(trimmed);
    if (!match) return undefined;
    const value = DateTime.local(Number(match[2]), Number(match[1]), 1);
    return value.isValid ? { value, hasTime: false } : undefined;
  }
  const match = REGIONAL_DATE.exec(trimmed);
  if (!match) return undefined;
  const [, first, , second, year, hour, minute] = match;
  const [day, month] = order === 'dmy' ? [first, second] : [second, first];
  const hasTime = mask === 'datetime' && hour !== undefined;
  const value = DateTime.local(
    Number(year),
    Number(month),
    Number(day),
    hasTime ? Number(hour) : 0,
    hasTime ? Number(minute) : 0,
  );
  return value.isValid ? { value, hasTime } : undefined;
};

/**
 * Lays `digits` out in the mask. A separator is only written once a digit
 * follows it, unless `trailingSeparator` asks for the one the user just
 * typed, so Backspace at the end never gets stuck on a dash.
 */
export const formatDigits = (
  digits: string,
  mask: DateMask,
  trailingSeparator = false,
): string => {
  let rest = digits.slice(0, maxDigits(mask));
  let out = '';
  for (const [length, separator] of SEGMENTS[mask]) {
    out += rest.slice(0, length);
    const complete = rest.length >= length;
    rest = rest.slice(length);
    if (!complete) break;
    if (separator && (rest.length > 0 || trailingSeparator)) out += separator;
    if (!rest.length) break;
  }
  return out;
};

/**
 * A pasted calendar date in ISO or SQL style (`2026-06-15`,
 * `2026-06-15T08:30:00+03:00`, `2026-06-15 08:30:00`). Only the calendar
 * shape: luxon would also read week (`2026-W24-1`) and ordinal
 * (`2026-166`) dates, which would turn odd input into an unrelated day.
 */
const PASTED_DATE =
  /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}(?::?\d{2})?)?)?$/i;

const parsePasted = (raw: string): DateTime | undefined => {
  const text = raw.trim();
  if (!PASTED_DATE.test(text)) return undefined;
  const dt = DateTime.fromISO(text.replace(' ', 'T'));
  return dt.isValid ? dt : undefined;
};

/**
 * What the input shows after a keystroke or paste: separators placed as the
 * digits arrive, anything else dropped. A full ISO value (with `T`, seconds
 * or an offset) is reformatted to the mask rather than having its extra
 * digits run together. An entry in the locale's own order is kept as typed
 * and reformatted to ISO once it is a whole date.
 */
export const applyMask = (
  raw: string,
  mask: DateMask,
  order: DateOrder = browserDateOrder(),
): string => {
  if (isRegionalEntry(raw, order)) {
    // Left as typed until it reads as a whole date, then shown in ISO like
    // everything else. Until then only the characters it can contain stay.
    const regional = parseRegional(raw, mask, order);
    if (regional) {
      return regional.value.toFormat(
        MASK_FORMATS[mask === 'datetime' && !regional.hasTime ? 'date' : mask],
      );
    }
    return raw
      .replace(/[^\d./\-\s:,]/g, '')
      .trimStart()
      .slice(0, 20);
  }
  const digits = digitsOf(raw);
  if (/[tT]/.test(raw) || digits.length > maxDigits(mask)) {
    const pasted = parsePasted(raw);
    if (pasted) return pasted.toFormat(MASK_FORMATS[mask]);
  }
  const atBoundary = SEGMENTS[mask].reduce<number[]>(
    (ends, [n, separator]) =>
      separator ? [...ends, (ends.at(-1) ?? 0) + n] : ends,
    [],
  );
  // Keep a separator the user typed right where one belongs: "2026-".
  const trailing = /\D$/.test(raw) && atBoundary.includes(digits.length);
  return formatDigits(digits, mask, trailing);
};

/** Index in `text` just after its `count`-th digit (0 for none). */
export const caretAfterDigits = (text: string, count: number): number => {
  if (count <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < text.length; i++) {
    if (/\d/.test(text[i]) && ++seen === count) {
      // Step over a separator that directly follows, so typing continues
      // in the next segment.
      return /\D/.test(text[i + 1] ?? '') ? i + 2 : i + 1;
    }
  }
  return text.length;
};

export type ParsedEntry =
  | { status: 'empty' }
  | { status: 'invalid' }
  | { status: 'valid'; value: DateTime; hasTime: boolean };

const PATTERNS: Record<DateMask, RegExp> = {
  date: /^\d{4}-\d{2}-\d{2}$/,
  datetime: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/,
  month: /^\d{4}-\d{2}$/,
};

/**
 * Reads a typed entry, in ISO order or the locale's own. With a time mask a
 * bare date is accepted too (`hasTime: false`), and gets the time a
 * calendar pick would.
 */
export const parseEntry = (
  text: string,
  mask: DateMask,
  order: DateOrder = browserDateOrder(),
): ParsedEntry => {
  const trimmed = text.trim();
  if (!trimmed) return { status: 'empty' };
  if (isRegionalEntry(trimmed, order)) {
    const regional = parseRegional(trimmed, mask, order);
    return regional ? { status: 'valid', ...regional } : { status: 'invalid' };
  }
  const attempts: Array<[DateMask, boolean]> =
    mask === 'datetime'
      ? [
          ['datetime', true],
          ['date', false],
        ]
      : [[mask, false]];
  for (const [shape, hasTime] of attempts) {
    if (!PATTERNS[shape].test(trimmed)) continue;
    const value = DateTime.fromFormat(trimmed, MASK_FORMATS[shape]);
    return value.isValid
      ? { status: 'valid', value, hasTime }
      : { status: 'invalid' };
  }
  return { status: 'invalid' };
};
