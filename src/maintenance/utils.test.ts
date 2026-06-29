import { describe, expect, it, vi, afterEach } from 'vitest';

import { validateWindow } from './utils';

describe('validateWindow', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('rejects non-array values', () => {
    expect(validateWindow(undefined)).toBeTruthy();
    expect(validateWindow(null)).toBeTruthy();
    expect(validateWindow('foo')).toBeTruthy();
  });

  it('rejects arrays of wrong length or non-Date items', () => {
    expect(validateWindow([])).toBeTruthy();
    expect(validateWindow([new Date()])).toBeTruthy();
    expect(validateWindow(['2099-01-01', '2099-01-02'])).toBeTruthy();
  });

  it('rejects when end is not after start', () => {
    const start = new Date('2099-01-01T00:00:00Z');
    const end = new Date('2099-01-01T00:00:00Z');
    expect(validateWindow([start, end])).toBeTruthy();

    const earlier = new Date('2098-12-31T00:00:00Z');
    expect(validateWindow([start, earlier])).toBeTruthy();
  });

  it('rejects past windows when creating a new maintenance', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2050-06-01T12:00:00Z'));
    const start = new Date('2050-05-01T00:00:00Z');
    const end = new Date('2050-05-01T01:00:00Z');
    expect(validateWindow([start, end])).toBeTruthy();
  });

  it('accepts past windows when editing an existing maintenance', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2050-06-01T12:00:00Z'));
    const start = new Date('2050-05-01T00:00:00Z');
    const end = new Date('2050-05-01T01:00:00Z');
    expect(
      validateWindow([start, end], { maintenanceUuid: 'some-uuid' }),
    ).toBeUndefined();
  });

  it('accepts a valid future window', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2050-06-01T12:00:00Z'));
    const start = new Date('2050-06-02T22:00:00Z');
    const end = new Date('2050-06-03T02:00:00Z');
    expect(validateWindow([start, end])).toBeUndefined();
  });
});
