import { DateTime, Settings } from 'luxon';
import { afterEach, describe, expect, it } from 'vitest';

import { LanguageUtilsService } from 'waldur-i18n-runtime';

import {
  daysUntilAccessEnds,
  formatDate,
  formatDateTime,
  formatDateTimeWithSeconds,
  formatDayMonth,
  formatMonth,
  formatRelative,
  formatRelativeWithHour,
  formatShortMonth,
  formatTime,
  formatUptime,
  lastAccessDate,
  parseCalendarDate,
  parseDate,
} from './dateUtils';

describe('formatRelative', () => {
  afterEach(() => {
    Settings.now = () => Date.now();
  });

  it('rounds to the nearest month instead of truncating', () => {
    // Regression test: a date ~58 days out (1.88 months) previously showed
    // "in 1 month" because Luxon's toRelative() truncates by default.
    const fixedNow = DateTime.fromISO('2026-08-04').toMillis();
    Settings.now = () => fixedNow;

    expect(formatRelative('2026-10-01')).toBe('in 2 months');
  });

  it('still rounds down correctly when close to the lower unit', () => {
    // ~32 days out (1.07 months) should round down to "in 1 month".
    const fixedNow = DateTime.fromISO('2026-08-04').toMillis();
    Settings.now = () => fixedNow;

    expect(formatRelative('2026-09-05')).toBe('in 1 month');
  });

  it('crosses into the next unit when rounding reaches its threshold', () => {
    // ~11.8 months out previously showed "in 12 months" because Luxon
    // picks the display unit from the un-rounded diff (years diff here is
    // 0.98, below 1) before rounding the number within that unit.
    const fixedNow = DateTime.fromISO('2026-08-04').toMillis();
    Settings.now = () => fixedNow;

    expect(formatRelative('2027-07-28')).toBe('in 1 year');
  });

  it('does not cross into the next unit when rounding stays below threshold', () => {
    // ~11.3 months out should still round to "in 11 months".
    const fixedNow = DateTime.fromISO('2026-08-04').toMillis();
    Settings.now = () => fixedNow;

    expect(formatRelative('2027-07-13')).toBe('in 11 months');
  });

  it('does not cross into years for a mid-range month count', () => {
    // ~8 months out has a raw years diff of 0.67, which rounds to 1 if
    // naively rounded at the years level — but 8 months should stay
    // "in 8 months", not jump to "in 1 year".
    const fixedNow = DateTime.fromISO('2026-08-04').toMillis();
    Settings.now = () => fixedNow;

    expect(formatRelative('2027-04-04')).toBe('in 8 months');
  });
  it('counts whole days for a calendar date, not from the current instant', () => {
    // A date carries no time, so it is that whole day. Measured from the
    // current instant it lost most of today and read one day short — and now
    // that these dates come from an authoritative server field (`eta_days` in
    // waldur/waldur-mastermind#332), an API saying 9 beside a UI saying 8 is a
    // discrepancy someone has to chase down.
    const fixedNow = DateTime.fromISO('2026-09-01T14:00:00').toMillis();
    Settings.now = () => fixedNow;

    expect(formatRelative('2026-09-10')).toBe('in 9 days');
    expect(formatRelative('2026-09-02')).toBe('in 1 day');
    expect(formatRelative('2026-08-31')).toBe('1 day ago');
  });

  it('calls a calendar date of today "today", not "in 0 days"', () => {
    const fixedNow = DateTime.fromISO('2026-09-01T14:00:00').toMillis();
    Settings.now = () => fixedNow;

    expect(formatRelative('2026-09-01')).toBe('today');
    // Only the zero case takes the worded form; turning it on generally would
    // render every "in 1 day" as "tomorrow" across the app.
    expect(formatRelative('2026-09-02')).toBe('in 1 day');
  });

  it('holds at every hour of the day, not just at midnight', () => {
    for (const hour of ['00:01', '09:30', '14:00', '23:59']) {
      const fixedNow = DateTime.fromISO(`2026-09-01T${hour}:00`).toMillis();
      Settings.now = () => fixedNow;
      expect(formatRelative('2026-09-10')).toBe('in 9 days');
    }
  });

  it('keeps instant precision for a timestamp', () => {
    // Only dates are whole days; a timestamp still reports hours.
    const fixedNow = DateTime.fromISO('2026-09-01T14:00:00').toMillis();
    Settings.now = () => fixedNow;

    expect(formatRelative('2026-09-01T09:00:00')).toBe('5 hours ago');
  });
});

// Waldur ends access *at* an end date (Project.is_expired is
// `effective_end_date <= today`), so a project ending 30 Sep is unusable on
// the 30th and the last day anyone can work is the 29th. Users read the end
// date as their last day and lose a day to it, so these helpers count to the
// last usable day instead.
describe('exclusive end dates', () => {
  afterEach(() => {
    Settings.now = () => Date.now();
  });

  const freezeAt = (iso: string) => {
    const fixedNow = DateTime.fromISO(iso).toMillis();
    Settings.now = () => fixedNow;
  };

  it('treats the day before the end date as the last day of access', () => {
    expect(lastAccessDate('2026-09-30').toISODate()).toBe('2026-09-29');
  });

  it('counts one day fewer than the gap to the end date', () => {
    freezeAt('2026-09-16');

    // 16 Sep to 30 Sep is 14 days, but the 30th is already gone.
    expect(daysUntilAccessEnds('2026-09-30')).toBe(13);
  });

  it('is not thrown off by the time of day', () => {
    freezeAt('2026-09-16T23:30:00');

    expect(daysUntilAccessEnds('2026-09-30')).toBe(13);
  });

  it('reports zero on the last usable day', () => {
    freezeAt('2026-09-29T09:00:00');

    expect(daysUntilAccessEnds('2026-09-30')).toBe(0);
  });

  it('goes negative once access has ended', () => {
    freezeAt('2026-09-30T09:00:00');

    expect(daysUntilAccessEnds('2026-09-30')).toBe(-1);
  });
});

describe('display formatters', () => {
  afterEach(() => {
    LanguageUtilsService.currentLanguage = undefined;
  });

  const setLanguage = (code: string) => {
    LanguageUtilsService.currentLanguage = { code, label: code };
  };

  const instant = DateTime.fromISO('2027-02-26T14:05:00');

  it('writes English dates day-first', () => {
    setLanguage('en');
    expect(formatDate(instant)).toBe('26 Feb 2027');
    expect(formatDateTime(instant)).toBe('26 Feb 2027, 14:05');
    expect(formatTime(instant)).toBe('14:05');
    expect(formatMonth(instant)).toBe('February 2027');
    expect(formatShortMonth(instant)).toBe('Feb 2027');
    expect(formatDayMonth(instant)).toBe('26 Feb');
  });

  it('keeps seconds where an event log needs them', () => {
    setLanguage('en');
    expect(
      formatDateTimeWithSeconds(DateTime.fromISO('2027-02-26T14:05:09')),
    ).toBe('26 Feb 2027, 14:05:09');
  });

  it('names a month on its own in the nominative case', () => {
    // MMMM is the genitive ("of February"), right only after a day.
    setLanguage('ru');
    expect(formatMonth(instant)).toBe('февраль 2027 г.');
    setLanguage('fi');
    expect(formatMonth(instant)).toBe('helmikuu 2027');
  });

  it('follows the locale pattern instead of a fixed token string', () => {
    // 'd LLL yyyy' gave "26 02 2027" in Lithuanian and "26 февр 2027" (wrong
    // case, no year marker) in Russian.
    setLanguage('lt');
    expect(formatDate(instant)).toBe('2027-02-26');
    setLanguage('ru');
    expect(formatDate(instant)).toBe('26 февр. 2027 г.');
  });

  it('shows a dash for a missing date instead of today', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDateTime(undefined)).toBe('—');
    expect(formatRelative(null)).toBe('—');
    expect(parseDate(null).isValid).toBe(false);
  });

  it('translates durations', () => {
    const fixedNow = DateTime.fromISO('2026-09-03T12:00:00').toMillis();
    Settings.now = () => fixedNow;
    setLanguage('en');
    expect(formatUptime('2026-09-01T09:00:00')).toBe('2d 3h');
    setLanguage('de');
    expect(formatUptime('2026-09-01T09:00:00')).toBe('2 T, 3h');
    Settings.now = () => Date.now();
  });
});

describe('formatRelativeWithHour', () => {
  afterEach(() => {
    Settings.now = () => Date.now();
  });

  it('counts down hours and minutes within a day', () => {
    const fixedNow = DateTime.fromISO('2026-09-01T12:00:00').toMillis();
    Settings.now = () => fixedNow;
    expect(formatRelativeWithHour('2026-09-01T15:05:00')).toBe(
      '3 hours, 5 minutes',
    );
  });

  it('never rounds the minutes up to a full hour', () => {
    const fixedNow = DateTime.fromISO('2026-09-01T12:00:00').toMillis();
    Settings.now = () => fixedNow;
    expect(formatRelativeWithHour('2026-09-01T14:59:50')).toBe(
      '2 hours, 59 minutes',
    );
  });

  it('reads a past date as relative, not as zero minutes', () => {
    const fixedNow = DateTime.fromISO('2026-09-01T12:00:00').toMillis();
    Settings.now = () => fixedNow;
    expect(formatRelativeWithHour('2026-09-01T09:00:00')).toBe('3 hours ago');
    expect(formatRelativeWithHour('2026-08-29T12:00:00')).toBe('3 days ago');
  });
});

describe('parseCalendarDate', () => {
  it('keeps the date a timestamp names in its own offset', () => {
    // West of UTC a local conversion makes this the 29th.
    expect(parseCalendarDate('2026-09-30T00:00:00Z').toISODate()).toBe(
      '2026-09-30',
    );
    expect(parseCalendarDate('2026-09-30').toISODate()).toBe('2026-09-30');
  });
});
