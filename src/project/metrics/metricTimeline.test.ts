import { describe, expect, it } from 'vitest';

import {
  getBucketValues,
  getTimelineAxis,
  getTimelineEnd,
  getTimelineQuery,
  spreadCounter,
} from './metricTimeline';

const MINUTE = 60000;
const HOUR = 60 * MINUTE;
const T0 = Date.parse('2026-10-26T12:00:00Z');
const at = (minutes: number, value: number) => ({
  timestamp: new Date(T0 + minutes * MINUTE).toISOString(),
  value,
});
const key = (minutes: number) => String(T0 + minutes * MINUTE);

describe('spreadCounter', () => {
  it('spreads a point over the time since the one before, in the window', () => {
    const { values } = spreadCounter(
      // Read half an hour before the window, then every few minutes.
      [at(-30, 999), at(30, 600), at(35, 25)],
      5 * MINUTE,
      T0,
    );

    // 600 over an hour: the half inside the window, 50 per five minutes.
    expect(Object.fromEntries(values)).toEqual({
      [key(0)]: 50,
      [key(5)]: 50,
      [key(10)]: 50,
      [key(15)]: 50,
      [key(20)]: 50,
      [key(25)]: 50,
      [key(30)]: 25,
    });
  });

  it('keeps a first point, with none before it, in its own bucket', () => {
    const { values } = spreadCounter([at(12, 40)], 5 * MINUTE, T0);

    expect(Object.fromEntries(values)).toEqual({ [key(10)]: 40 });
  });
});

describe('getBucketValues', () => {
  it('gives a steady rate in every bucket, the one still filling too', () => {
    // One unit a second, read at three minutes past each five.
    const points = [-2, 3, 8, 13].map((minute) => at(minute, 300));
    const end = T0 + 13 * MINUTE;

    const rates = getBucketValues('6h', end, points, {
      counter: true,
      spread: true,
      rate: true,
    });

    [0, 5, 10].forEach((minute) => expect(rates.get(key(minute))).toBe(1));
  });

  it('bridges a gauge over its polling interval, not over days', () => {
    const end = T0 + 7 * 24 * HOUR;
    const values = getBucketValues(
      '7d',
      end,
      // Read every six hours, then stopped for three days.
      [at(0, 10), at(360, 20), at(360 + 3 * 24 * 60, 30)],
      { counter: false },
    );

    // The reading at 6 hours stands for the five hours before it.
    expect(values.get(key(60))).toBe(20);
    expect(values.get(key(300))).toBe(20);
    // Nothing while it was stopped.
    expect(values.get(key(24 * 60))).toBeUndefined();
  });

  it('adds up a day’s points for the daily chart', () => {
    const values = getBucketValues(
      '90d',
      T0,
      [at(0, 1), at(60, 2), { timestamp: '2026-10-25T00:00:00Z', value: 5 }],
      { counter: true },
    );

    expect(Object.fromEntries(values)).toEqual({
      '2026-10-26': 3,
      '2026-10-25': 5,
    });
  });
});

describe('getTimelineAxis', () => {
  it('has a bucket every five minutes over six hours', () => {
    const axis = getTimelineAxis('6h', T0, []);

    expect(axis.keys).toHaveLength(73);
    expect(axis.keys[0]).toBe(key(-360));
    expect(axis.keys.at(-1)).toBe(key(0));
  });

  it('slides with a newer point rather than growing', () => {
    const end = getTimelineEnd(T0, [at(180, 1)]);
    const axis = getTimelineAxis('6h', end, [at(180, 1)]);

    expect(axis.keys).toHaveLength(73);
    expect(axis.keys[0]).toBe(key(-180));
  });

  it('starts the daily axis at the first day with data, two weeks at least', () => {
    const axis = getTimelineAxis('90d', T0, [at(0, 1)]);

    expect(axis.keys).toHaveLength(14);
    expect(axis.keys.at(-1)).toBe('2026-10-26');
  });
});

describe('getTimelineQuery', () => {
  it('asks for raw points from a whole hour, a day before a short window', () => {
    const query = getTimelineQuery('6h', T0 + 17 * MINUTE);

    expect(query.granularity).toBe('raw');
    expect(query.start).toBe(new Date(T0 - 31 * HOUR).toISOString());
    // Asked again within the hour, it is the same query.
    expect(getTimelineQuery('6h', T0 + 50 * MINUTE)).toEqual(query);
  });

  it('asks for daily roll-ups over 90 days', () => {
    expect(getTimelineQuery('90d', T0)).toEqual({
      start: '2026-07-29T00:00:00.000Z',
      granularity: 'day',
    });
  });
});
