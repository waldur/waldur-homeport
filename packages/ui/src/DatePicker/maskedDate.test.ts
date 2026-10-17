import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';

import { validateEntry } from './dateEntry';
import {
  applyMask,
  caretAfterDigits,
  dateOrderOf,
  parseEntry,
} from './maskedDate';

describe('applyMask', () => {
  it('puts the separators in as digits arrive', () => {
    expect(applyMask('2026', 'date')).toBe('2026');
    expect(applyMask('20260', 'date')).toBe('2026-0');
    expect(applyMask('20260615', 'date')).toBe('2026-06-15');
    expect(applyMask('202606150830', 'datetime')).toBe('2026-06-15 08:30');
    expect(applyMask('202606', 'month')).toBe('2026-06');
  });

  it('drops anything but digits and stops at the mask length', () => {
    expect(applyMask('2026/06/15', 'date')).toBe('2026-06-15');
    expect(applyMask('2026-06-15x', 'date')).toBe('2026-06-15');
    expect(applyMask('2026-06-159', 'date')).toBe('2026-06-15');
    expect(applyMask('abc', 'date')).toBe('');
  });

  it('keeps a separator typed where one belongs', () => {
    expect(applyMask('2026-', 'date')).toBe('2026-');
    expect(applyMask('2026-06-15 ', 'datetime')).toBe('2026-06-15 ');
    // Not after the last segment.
    expect(applyMask('2026-06-', 'month')).toBe('2026-06');
  });

  it('does not read week or ordinal dates into a calendar day', () => {
    expect(applyMask('2026-W24-1', 'date')).toBe('2026-24-1');
    expect(applyMask('2026-166T00:00', 'date')).toBe('2026-16-60');
    expect(applyMask('2026-061-15', 'date')).toBe('2026-06-11');
  });

  it('reformats a pasted ISO datetime to the mask', () => {
    const iso = DateTime.local(2026, 6, 15, 8, 30).toISO();
    expect(applyMask(iso, 'date')).toBe('2026-06-15');
    expect(applyMask(iso, 'datetime')).toBe('2026-06-15 08:30');
    expect(applyMask(iso, 'month')).toBe('2026-06');
    expect(applyMask(' 2026-06-15 ', 'date')).toBe('2026-06-15');
  });
});

describe('caretAfterDigits', () => {
  it('lands after the n-th digit, stepping over a following separator', () => {
    expect(caretAfterDigits('2026-06-15', 0)).toBe(0);
    expect(caretAfterDigits('2026-06-15', 3)).toBe(3);
    expect(caretAfterDigits('2026-06-15', 4)).toBe(5);
    expect(caretAfterDigits('2026-06-15', 8)).toBe(10);
  });
});

describe('parseEntry', () => {
  it('reads complete entries only', () => {
    expect(parseEntry('', 'date')).toEqual({ status: 'empty' });
    expect(parseEntry('2026-06', 'date')).toEqual({ status: 'invalid' });
    expect(parseEntry('2026-02-30', 'date')).toEqual({ status: 'invalid' });
    const parsed = parseEntry('2026-06-15', 'date');
    expect(parsed.status).toBe('valid');
  });

  it('accepts a bare date where a time is optional', () => {
    const bare = parseEntry('2026-06-15', 'datetime');
    expect(bare).toMatchObject({ status: 'valid', hasTime: false });
    const full = parseEntry('2026-06-15 08:30', 'datetime');
    expect(full).toMatchObject({ status: 'valid', hasTime: true });
    expect(parseEntry('2026-06-15 25:00', 'datetime')).toEqual({
      status: 'invalid',
    });
  });
});

describe('validateEntry', () => {
  it('refuses what is not a date', () => {
    expect(validateEntry('2026-13-01', 'date')).toMatchObject({
      status: 'error',
      message: 'Enter a date as YYYY-MM-DD.',
    });
  });

  it('refuses days outside the bounds instead of clamping them', () => {
    const rules = { minDate: '2026-06-05', maxDate: '2026-06-25' };
    expect(validateEntry('2026-06-04', 'date', rules)).toMatchObject({
      status: 'error',
      message: 'Enter a date on or after 2026-06-05.',
    });
    expect(validateEntry('2026-06-26', 'date', rules)).toMatchObject({
      status: 'error',
      message: 'Enter a date on or before 2026-06-25.',
    });
    expect(validateEntry('2026-06-05', 'date', rules).status).toBe('ok');
  });

  it('compares a typed time to the minute, a bare date to the day', () => {
    const rules = { minDate: new Date(2026, 5, 15, 14, 0) };
    expect(validateEntry('2026-06-15 13:59', 'datetime', rules)).toMatchObject({
      status: 'error',
      message: 'Enter a date on or after 2026-06-15 14:00.',
    });
    expect(validateEntry('2026-06-15', 'datetime', rules).status).toBe('ok');
  });

  it('refuses days `enable` does not match', () => {
    const weekdays = [(d: Date) => d.getDay() !== 0 && d.getDay() !== 6];
    expect(
      validateEntry('2026-06-13', 'date', { enable: weekdays }),
    ).toMatchObject({
      status: 'error',
      message: 'This date is not available.',
    });
    expect(
      validateEntry('2026-06-15', 'date', { enable: weekdays }).status,
    ).toBe('ok');
  });

  it('checks months at month granularity', () => {
    const rules = { minDate: '2026-06-20' };
    expect(validateEntry('2026-06', 'month', rules).status).toBe('ok');
    expect(validateEntry('2026-05', 'month', rules)).toMatchObject({
      status: 'error',
      message: 'Enter a month on or after 2026-06.',
    });
  });
});

describe("entries in the locale's own order", () => {
  it('reads the order from the locale', () => {
    expect(dateOrderOf('et-EE')).toBe('dmy');
    expect(dateOrderOf('en-GB')).toBe('dmy');
    expect(dateOrderOf('en-US')).toBe('mdy');
    // Lithuanian and Swedish already write ISO order.
    expect(dateOrderOf('lt-LT')).toBe('ymd');
    expect(dateOrderOf('sv-SE')).toBe('ymd');
  });

  it('reformats a whole regional date to ISO', () => {
    expect(applyMask('15.06.2026', 'date', 'dmy')).toBe('2026-06-15');
    expect(applyMask('5.6.2026', 'date', 'dmy')).toBe('2026-06-05');
    expect(applyMask('15/06/2026', 'date', 'dmy')).toBe('2026-06-15');
    expect(applyMask('6/15/2026', 'date', 'mdy')).toBe('2026-06-15');
    expect(applyMask('15.06.2026 14:30', 'datetime', 'dmy')).toBe(
      '2026-06-15 14:30',
    );
    expect(applyMask('15.06.2026', 'datetime', 'dmy')).toBe('2026-06-15');
    expect(applyMask('06.2026', 'month', 'dmy')).toBe('2026-06');
  });

  it('drops a time pasted into a date-only field', () => {
    expect(applyMask('15.06.2026 14:30', 'date', 'dmy')).toBe('2026-06-15');
  });

  it('keeps a partial regional entry as typed', () => {
    expect(applyMask('15.', 'date', 'dmy')).toBe('15.');
    expect(applyMask('15.06.20', 'date', 'dmy')).toBe('15.06.20');
    expect(applyMask('15.0x6', 'date', 'dmy')).toBe('15.06');
  });

  it('leaves ISO entries to the ISO mask in any locale', () => {
    expect(applyMask('2026-06-15', 'date', 'dmy')).toBe('2026-06-15');
    expect(applyMask('20260615', 'date', 'mdy')).toBe('2026-06-15');
  });

  it('runs the digits together in an ISO-order locale, as before', () => {
    expect(applyMask('15.06.2026', 'date', 'ymd')).toBe('1506-20-26');
  });

  it('parses regional entries, and refuses impossible ones', () => {
    expect(parseEntry('15.06.2026', 'date', 'dmy')).toEqual({
      status: 'valid',
      value: DateTime.local(2026, 6, 15),
      hasTime: false,
    });
    expect(parseEntry('15.06.2026 14:30', 'datetime', 'dmy')).toEqual({
      status: 'valid',
      value: DateTime.local(2026, 6, 15, 14, 30),
      hasTime: true,
    });
    expect(parseEntry('31.02.2026', 'date', 'dmy').status).toBe('invalid');
    // Day-first in a month-first locale: month 15.
    expect(parseEntry('15/06/2026', 'date', 'mdy').status).toBe('invalid');
    expect(parseEntry('15.06.20', 'date', 'dmy').status).toBe('invalid');
  });
});
