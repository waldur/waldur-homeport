import { DateTime, Settings } from 'luxon';
import { afterEach, describe, expect, it } from 'vitest';

import {
  dateRangeOptions,
  presetToRange,
  rangeToPreset,
} from './dateRangePresets';

// Resolved eagerly: a Settings.now that parses a date on each call recurses,
// because luxon reads Settings.now while constructing the DateTime.
const FIXED_NOW = DateTime.fromISO('2026-08-10').toMillis();
const NEXT_DAY = DateTime.fromISO('2026-08-11').toMillis();

afterEach(() => {
  Settings.now = () => Date.now();
});

describe('presetToRange', () => {
  it('spans the requested number of days inclusive of today', () => {
    Settings.now = () => FIXED_NOW;

    expect(presetToRange(7)).toEqual({ min: '2026-08-04', max: '2026-08-10' });
  });
});

describe('rangeToPreset', () => {
  it('recognises every range its own presets can produce', () => {
    Settings.now = () => FIXED_NOW;

    dateRangeOptions.forEach((option) => {
      expect(rangeToPreset(presetToRange(option.value))).toBe(option.value);
    });
  });

  it('returns undefined when no range is set', () => {
    Settings.now = () => FIXED_NOW;

    expect(rangeToPreset(undefined)).toBeUndefined();
  });

  it('returns undefined for a hand-picked range', () => {
    Settings.now = () => FIXED_NOW;

    expect(
      rangeToPreset({ min: '2026-01-01', max: '2026-03-01' }),
    ).toBeUndefined();
  });

  it('returns undefined for an open-ended range', () => {
    // Only reachable from a hand-edited URL: RangeDateField never commits a
    // half-finished selection.
    Settings.now = () => FIXED_NOW;

    expect(rangeToPreset({ min: '2026-08-04' })).toBeUndefined();
  });

  it('stops recognising a window once it no longer ends today', () => {
    // A bookmarked URL reopened the next day holds absolute dates that no
    // preset describes any more.
    Settings.now = () => NEXT_DAY;

    expect(
      rangeToPreset({ min: '2026-08-04', max: '2026-08-10' }),
    ).toBeUndefined();
  });
});
