import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';

import {
  boundsToDisabled,
  boundsToMonths,
  clampToBounds,
  parseBound,
  parseDateValue,
  withTime,
} from './dateBounds';

describe('dateBounds', () => {
  describe('parseBound', () => {
    it('returns undefined for empty bounds', () => {
      expect(parseBound(null)).toBeUndefined();
      expect(parseBound(undefined)).toBeUndefined();
      expect(parseBound('')).toBeUndefined();
    });

    it('parses "today" as start of today', () => {
      const bound = parseBound('today');
      expect(bound).toBeDefined();
      expect(bound?.hasSame(DateTime.now(), 'day')).toBe(true);
      expect(bound?.hour).toBe(0);
      expect(bound?.minute).toBe(0);
      expect(bound?.second).toBe(0);
    });

    it('parses "now" as the current moment', () => {
      const before = DateTime.now();
      const bound = parseBound('now');
      const after = DateTime.now();
      expect(bound).toBeDefined();
      expect(bound! >= before && bound! <= after).toBe(true);
    });

    it('parses Date, DateTime, and ISO strings', () => {
      const dt = DateTime.fromISO('2026-06-15T10:30:00');
      expect(parseBound(dt)?.toISO()).toBe(dt.toISO());
      expect(parseBound(dt.toJSDate())?.toISO()).toBe(dt.toISO());
      expect(parseBound('2026-06-15T10:30:00')?.hasSame(dt, 'minute')).toBe(
        true,
      );
    });

    it('returns undefined for invalid strings', () => {
      expect(parseBound('not-a-date')).toBeUndefined();
    });
  });

  describe('clampToBounds', () => {
    const min = '2026-06-10T10:00:00';
    const max = '2026-06-20T18:00:00';

    it('clamps values before minDate', () => {
      const value = DateTime.fromISO('2026-06-05T12:00:00');
      const clamped = clampToBounds(value, min, max);
      expect(clamped.hasSame(DateTime.fromISO(min), 'minute')).toBe(true);
    });

    it('clamps values after maxDate', () => {
      const value = DateTime.fromISO('2026-06-25T12:00:00');
      const clamped = clampToBounds(value, min, max);
      expect(clamped.hasSame(DateTime.fromISO(max), 'minute')).toBe(true);
    });

    it('leaves values within bounds intact', () => {
      const value = DateTime.fromISO('2026-06-15T12:00:00');
      const clamped = clampToBounds(value, min, max);
      expect(clamped.hasSame(value, 'minute')).toBe(true);
    });
  });

  describe('boundsToDisabled & boundsToMonths', () => {
    it('generates matchers for before min and after max', () => {
      const matchers = boundsToDisabled('2026-06-10', '2026-06-20');
      expect(matchers).toHaveLength(2);
      expect(matchers[0]).toEqual({
        before: DateTime.fromISO('2026-06-10').startOf('day').toJSDate(),
      });
      expect(matchers[1]).toEqual({
        after: DateTime.fromISO('2026-06-20').startOf('day').toJSDate(),
      });
    });

    it('determines month range', () => {
      const months = boundsToMonths('2026-06-10', '2026-08-20');
      expect(months.startMonth).toEqual(
        DateTime.fromISO('2026-06-01').startOf('month').toJSDate(),
      );
      expect(months.endMonth).toEqual(
        DateTime.fromISO('2026-08-01').startOf('month').toJSDate(),
      );
    });
  });

  describe('parseDateValue and withTime', () => {
    it('parses valid date values', () => {
      expect(parseDateValue(null)).toBeNull();
      expect(parseDateValue('invalid')).toBeNull();
      const date = new Date(2026, 5, 15);
      expect(parseDateValue(date)).toBe(date);
      expect(parseDateValue('2026-06-15')).toEqual(
        DateTime.fromISO('2026-06-15').toJSDate(),
      );
    });

    it('stamps time onto a date', () => {
      const day = new Date(2026, 5, 15);
      const withT = withTime(day, { hour: 14, minute: 30 });
      expect(withT.hour).toBe(14);
      expect(withT.minute).toBe(30);
      expect(withT.second).toBe(0);
      expect(withT.day).toBe(15);
    });
  });
});
