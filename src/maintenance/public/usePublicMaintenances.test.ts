import { afterEach, describe, expect, it, vi } from 'vitest';
import { PublicMaintenanceAnnouncement } from 'waldur-js-client';

import {
  getMaintenancesForOffering,
  isCurrentOrUpcoming,
  isUnderway,
} from './usePublicMaintenances';

const OFFERING_UUID = 'offering-1';

const makeMaintenance = (
  overrides: Partial<PublicMaintenanceAnnouncement>,
): PublicMaintenanceAnnouncement =>
  ({
    uuid: 'm1',
    state: 'Scheduled',
    scheduled_start: '2050-01-01T10:00:00Z',
    scheduled_end: '2050-01-01T12:00:00Z',
    affected_offerings: [
      { offering: `https://api/offerings/${OFFERING_UUID}/` },
    ],
    ...overrides,
  }) as PublicMaintenanceAnnouncement;

describe('isCurrentOrUpcoming', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps a maintenance whose window is still in the future', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2050-01-01T09:00:00Z'));
    expect(isCurrentOrUpcoming(makeMaintenance({}))).toBe(true);
  });

  it('keeps a maintenance whose window is happening now', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2050-01-01T11:00:00Z'));
    expect(isCurrentOrUpcoming(makeMaintenance({}))).toBe(true);
  });

  it('hides a maintenance whose window has already elapsed', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2050-06-01T00:00:00Z'));
    expect(isCurrentOrUpcoming(makeMaintenance({}))).toBe(false);
  });

  it('keeps a maintenance without a scheduled end', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2050-06-01T00:00:00Z'));
    expect(
      isCurrentOrUpcoming(makeMaintenance({ scheduled_end: undefined })),
    ).toBe(true);
  });
});

describe('isUnderway', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('is underway once started by the provider', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2050-01-01T09:00:00Z'));
    expect(isUnderway(makeMaintenance({ state: 'In progress' }))).toBe(true);
  });

  it('is underway when still Scheduled but its window has opened', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2050-01-01T11:00:00Z'));
    expect(isUnderway(makeMaintenance({}))).toBe(true);
  });

  it('is not underway before its window opens', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2050-01-01T09:00:00Z'));
    expect(isUnderway(makeMaintenance({}))).toBe(false);
  });

  it('is not underway once its window has closed', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2050-01-01T13:00:00Z'));
    expect(isUnderway(makeMaintenance({}))).toBe(false);
  });

  it('is underway with an open window and no scheduled end', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2050-01-01T11:00:00Z'));
    expect(isUnderway(makeMaintenance({ scheduled_end: undefined }))).toBe(
      true,
    );
  });
});

describe('getMaintenancesForOffering', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns [] when no offering uuid is given', () => {
    expect(
      getMaintenancesForOffering([makeMaintenance({})], undefined),
    ).toEqual([]);
  });

  it('excludes stale (already-elapsed) maintenances even if state is active', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2050-06-01T00:00:00Z'));
    const stale = makeMaintenance({ state: 'In progress' });
    expect(getMaintenancesForOffering([stale], OFFERING_UUID)).toEqual([]);
  });

  it('includes current/upcoming maintenances for the matching offering', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2050-01-01T09:00:00Z'));
    const upcoming = makeMaintenance({});
    expect(getMaintenancesForOffering([upcoming], OFFERING_UUID)).toEqual([
      upcoming,
    ]);
  });

  it('excludes maintenances that do not affect the offering', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2050-01-01T09:00:00Z'));
    const other = makeMaintenance({
      affected_offerings: [
        { offering: 'https://api/offerings/other/' },
      ] as PublicMaintenanceAnnouncement['affected_offerings'],
    });
    expect(getMaintenancesForOffering([other], OFFERING_UUID)).toEqual([]);
  });
});
