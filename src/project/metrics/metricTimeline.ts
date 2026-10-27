import { translate } from '@/i18n';

/**
 * The span a metric card's chart covers, and how it buckets the points: days
 * from the daily roll-ups, or minutes and hours from the points themselves,
 * for a resource read often while someone looks into it.
 */
export type MetricRange = '6h' | '24h' | '7d' | '90d';

export const DEFAULT_RANGE: MetricRange = '90d';

export const getMetricRangeOptions = () => [
  { value: '6h' as const, label: translate('6 hours') },
  { value: '24h' as const, label: translate('24 hours') },
  { value: '7d' as const, label: translate('7 days') },
  { value: '90d' as const, label: translate('90 days') },
];

export interface TimelinePoint {
  timestamp: string;
  value: number | string | null;
}

const MINUTE = 60000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// Labelled with the date: a day's span crosses midnight.
const FINE_LABEL: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

const FINE: Record<
  Exclude<MetricRange, '90d'>,
  { span: number; bucket: number }
> = {
  '6h': { span: 6 * HOUR, bucket: 5 * MINUTE },
  '24h': { span: DAY, bucket: 15 * MINUTE },
  '7d': { span: 7 * DAY, bucket: HOUR },
};

// A counter's point holds what it added since the point before, at most a
// day earlier with the slowest polling, and a little more as reads drift:
// that much more is asked for, so the first point in the window can be
// spread back over its own interval. A gauge's line bridges gaps up to it.
const MAX_READ_GAP = DAY + HOUR;

const TREND_DAYS = 90;
// The daily axis starts at the first day with data, but never shows fewer
// days than this, so a week-old metric is not stretched into three bars.
const MIN_AXIS_DAYS = 14;

// Daily roll-ups start at UTC midnight; they are keyed and labelled in UTC
// too, or a viewer west of Greenwich sees every bucket a day early.
const dayKey = (time: number) => new Date(time).toISOString().slice(0, 10);
const dayLabel = (time: number) =>
  new Date(time).toLocaleDateString(undefined, {
    timeZone: 'UTC',
    month: 'short',
    day: 'numeric',
  });

const startOfUtcDay = (time: number) => Math.floor(time / DAY) * DAY;
const floorTo = (time: number, step: number) => Math.floor(time / step) * step;

/**
 * What to ask the series endpoint for. The start is rounded down to the hour,
 * so asking again within the hour, as Refresh does, reuses the same query.
 */
export const getTimelineQuery = (range: MetricRange, anchor: number) =>
  range === '90d'
    ? {
        start: new Date(
          startOfUtcDay(anchor) - (TREND_DAYS - 1) * DAY,
        ).toISOString(),
        granularity: 'day' as const,
      }
    : {
        start: new Date(
          floorTo(anchor - FINE[range].span - MAX_READ_GAP, HOUR),
        ).toISOString(),
        granularity: 'raw' as const,
      };

/** The chart's last moment: when it was asked for, or a newer point. */
export const getTimelineEnd = (anchor: number, points: TimelinePoint[]) =>
  points.reduce(
    (latest, point) => Math.max(latest, Date.parse(point.timestamp)),
    anchor,
  );

const windowStart = (range: Exclude<MetricRange, '90d'>, end: number) =>
  floorTo(end - FINE[range].span, FINE[range].bucket);

/** The chart's buckets, by key, and their labels, up to end. */
export const getTimelineAxis = (
  range: MetricRange,
  end: number,
  points: TimelinePoint[],
) => {
  if (range === '90d') {
    const today = startOfUtcDay(end);
    const days = Array.from(
      { length: TREND_DAYS },
      (_, index) => today - (TREND_DAYS - 1 - index) * DAY,
    );
    const withData = new Set(
      points.map((point) => point.timestamp.slice(0, 10)),
    );
    const first = days.findIndex((day) => withData.has(dayKey(day)));
    const from =
      first < 0 ? 0 : Math.max(0, Math.min(first, TREND_DAYS - MIN_AXIS_DAYS));
    const shown = days.slice(from);
    return { keys: shown.map(dayKey), labels: shown.map(dayLabel) };
  }
  // The window slides with the newest point: it never grows past its span.
  const starts = [];
  for (
    let start = windowStart(range, end);
    start <= end;
    start += FINE[range].bucket
  ) {
    starts.push(start);
  }
  return {
    keys: starts.map(String),
    labels: starts.map((start) =>
      new Date(start).toLocaleString(undefined, FINE_LABEL),
    ),
  };
};

const sorted = (points: TimelinePoint[]) =>
  points
    .filter((point) => point.value !== null && point.value !== undefined)
    .map((point) => [Date.parse(point.timestamp), Number(point.value)])
    .sort((a, b) => a[0] - b[0]);

/**
 * Each counter point spread evenly over the time since the point before it,
 * bucket by bucket: a point read after six hours holds six hours' worth, and
 * put into one five-minute bucket it would dwarf the ones read every five
 * minutes. A first point, with none before it, stays in its own bucket.
 * Also how much of each bucket the points cover, for rates.
 */
export const spreadCounter = (
  points: TimelinePoint[],
  bucket: number,
  from: number,
) => {
  const values = new Map<string, number>();
  const covered = new Map<string, number>();
  const add = (time: number, value: number, duration: number) => {
    const key = String(floorTo(time, bucket));
    values.set(key, (values.get(key) ?? 0) + value);
    covered.set(key, (covered.get(key) ?? 0) + duration);
  };
  let previous: number | null = null;
  for (const [time, value] of sorted(points)) {
    const begin = previous ?? time;
    previous = time;
    if (time < from) continue;
    if (begin >= time) {
      add(time, value, bucket);
      continue;
    }
    // Only the part of the interval inside the window is shown.
    const rate = value / (time - begin);
    let cursor = Math.max(begin, from);
    while (cursor < time) {
      const end = Math.min(floorTo(cursor, bucket) + bucket, time);
      add(cursor, rate * (end - cursor), end - cursor);
      cursor = end;
    }
  }
  return { values, covered };
};

/** A counter's points added up per bucket, without spreading. */
const sumPerBucket = (
  points: TimelinePoint[],
  bucket: number,
  from: number,
  end: number,
) => {
  const values = new Map<string, number>();
  const covered = new Map<string, number>();
  for (const [time, value] of sorted(points)) {
    if (time < from) continue;
    const start = floorTo(time, bucket);
    values.set(String(start), (values.get(String(start)) ?? 0) + value);
    covered.set(String(start), Math.min(start + bucket, end) - start);
  }
  return { values, covered };
};

/**
 * A gauge's value in each bucket: each reading stands for the time since
 * the one before it, as utilization over a polling interval does, unless the
 * gap is too long to bridge, as when the resource was stopped for days.
 */
const fillGauge = (points: TimelinePoint[], bucket: number, from: number) => {
  const values = new Map<string, number>();
  let previous: number | null = null;
  for (const [time, value] of sorted(points)) {
    const bridged = previous !== null && time - previous <= MAX_READ_GAP;
    const first = bridged
      ? floorTo(previous, bucket) + bucket
      : floorTo(time, bucket);
    previous = time;
    if (time < from) continue;
    for (
      let start = Math.max(first, floorTo(from, bucket));
      start <= time;
      start += bucket
    ) {
      values.set(String(start), value);
    }
  }
  return values;
};

/**
 * A series' value in each bucket of the chart, keyed as the axis is, up to
 * end. A counter is spread over the time between its points when spread is
 * set, which needs the points of one series; with rate, it is per second
 * over the time each bucket covers.
 */
export const getBucketValues = (
  range: MetricRange,
  end: number,
  points: TimelinePoint[],
  options: { counter: boolean; spread?: boolean; rate?: boolean },
) => {
  if (range === '90d') {
    const values = new Map<string, number>();
    points.forEach((point) => {
      if (point.value === null || point.value === undefined) return;
      const key = point.timestamp.slice(0, 10);
      values.set(key, (values.get(key) ?? 0) + Number(point.value));
    });
    return values;
  }
  const { bucket } = FINE[range];
  const from = windowStart(range, end);
  if (!options.counter) return fillGauge(points, bucket, from);
  const { values, covered } = options.spread
    ? spreadCounter(points, bucket, from)
    : sumPerBucket(points, bucket, from, end);
  if (!options.rate) return values;
  const rates = new Map<string, number>();
  values.forEach((value, key) => {
    const seconds = (covered.get(key) ?? bucket) / 1000;
    rates.set(key, seconds > 0 ? value / seconds : 0);
  });
  return rates;
};

/** Whether the chart shows hours, from the raw points, rather than days. */
export const isFineRange = (range: MetricRange) => range !== '90d';
