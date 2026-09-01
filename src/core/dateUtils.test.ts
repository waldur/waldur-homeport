import { DateTime, Settings } from 'luxon';
import { afterEach, describe, expect, it } from 'vitest';

import { formatRelative } from './dateUtils';

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
