import { describe, expect, it } from 'vitest';

import {
  getFastIntervalOptions,
  getPollingStatus,
  InstanceMetricsPolling,
} from './instanceMetricsPolling';

const INSTANCE = 'aaaa';
const VOLUME = 'bbbb';

const polling = (
  overrides: Partial<InstanceMetricsPolling> = {},
): InstanceMetricsPolling => ({
  enabled: true,
  interval_minutes: 360,
  offering_interval_minutes: 360,
  faster_until: null,
  last_polled_at: '2026-10-26T13:27:00Z',
  next_poll_at: '2026-10-26T19:27:00Z',
  can_manage: true,
  instance_name: 'web-01',
  instance_resource_uuid: INSTANCE,
  ...overrides,
});

describe('getPollingStatus', () => {
  it('gives a running instance its interval, last and next read', () => {
    const status = getPollingStatus(polling(), INSTANCE, false);
    expect(status.label).toBe('Updated every 6 hours');
    expect(status.details).toHaveLength(2);
    expect(status.details[0]).toMatch(/^Last update /);
    expect(status.details[1]).toMatch(/^Next around /);
  });

  it('names the instance a volume is read with', () => {
    const status = getPollingStatus(polling(), VOLUME, true);
    expect(status.details[0]).toBe('Read with web-01');
  });

  it('says until when updates are faster', () => {
    const status = getPollingStatus(
      polling({ interval_minutes: 5, faster_until: '2026-10-27T13:27:00Z' }),
      INSTANCE,
      false,
    );
    expect(status.label).toMatch(/^Updated every 5 minutes until /);
    expect(
      getPollingStatus(polling({ interval_minutes: 60 }), INSTANCE, false)
        .label,
    ).toBe('Updated every hour');
  });

  it('says an instance that is not running is not read', () => {
    const status = getPollingStatus(
      polling({ next_poll_at: null, last_polled_at: null }),
      INSTANCE,
      false,
    );
    expect(status.label).toBe('Not read while the instance is not running.');
    expect(status.details).toEqual(['Not read yet']);
  });

  it('tells a detached volume from an instance without a server', () => {
    const unread = polling({
      instance_name: null,
      instance_resource_uuid: null,
      next_poll_at: null,
    });
    expect(getPollingStatus(unread, VOLUME, true).label).toBe(
      'Not read while the volume is detached from an instance.',
    );
    expect(getPollingStatus(unread, INSTANCE, false).label).toBe(
      'Not read: the instance has no OpenStack server.',
    );
  });
});

describe('getFastIntervalOptions', () => {
  it('offers only intervals faster than the provider’s', () => {
    const values = (minutes: number) =>
      getFastIntervalOptions(minutes).map((option) => option.value);
    expect(values(360)).toEqual([5, 15, 60]);
    expect(values(15)).toEqual([5]);
    expect(values(5)).toEqual([]);
  });
});
