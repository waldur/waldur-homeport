import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';

import { getTerminationDateProps } from './TerminationDateField';

const NOW = DateTime.fromISO('2026-07-24');

describe('getTerminationDateProps', () => {
  it('sets minDate to today when not required', () => {
    const result = getTerminationDateProps(undefined, { now: NOW });
    expect(result.minDate).toBe('2026-07-24');
    expect(result.maxDate).toBeUndefined();
    expect(result.defaultDate).toBeUndefined();
    expect(result.isClearable).toBeUndefined();
  });

  it('sets minDate to today when required is false', () => {
    const result = getTerminationDateProps(
      { is_resource_termination_date_required: false },
      { now: NOW },
    );
    expect(result.minDate).toBe('2026-07-24');
    expect(result.maxDate).toBeUndefined();
    expect(result.defaultDate).toBeUndefined();
  });

  it('caps maxDate at project end date even when termination is optional', () => {
    const result = getTerminationDateProps(
      { is_resource_termination_date_required: false },
      { now: NOW, projectEndDate: '2026-12-04' },
    );
    expect(result.maxDate).toBe('2026-12-04');
  });

  describe('when termination date is required', () => {
    it('sets defaultDate from offset and no maxDate when only default offset is set', () => {
      const result = getTerminationDateProps(
        {
          is_resource_termination_date_required: true,
          default_resource_termination_offset_in_days: 90,
        },
        { now: NOW },
      );
      expect(result.minDate).toBe('2026-07-24');
      expect(result.defaultDate).toBe('2026-10-22'); // 2026-07-24 + 90 days
      expect(result.maxDate).toBeUndefined();
      expect(result.isClearable).toBe(false);
    });

    it('does not set maxDate when max_resource_termination_offset_in_days is undefined (bug fix)', () => {
      const result = getTerminationDateProps(
        {
          is_resource_termination_date_required: true,
          default_resource_termination_offset_in_days: 90,
          max_resource_termination_offset_in_days: undefined,
        },
        { now: NOW },
      );
      expect(result.maxDate).toBeUndefined();
    });

    it('sets maxDate from max offset days when provided', () => {
      const result = getTerminationDateProps(
        {
          is_resource_termination_date_required: true,
          default_resource_termination_offset_in_days: 90,
          max_resource_termination_offset_in_days: 180,
        },
        { now: NOW },
      );
      expect(result.maxDate).toBe('2027-01-20'); // 2026-07-24 + 180 days
    });

    it('sets maxDate from latest_date_for_resource_termination when only that is set', () => {
      const result = getTerminationDateProps(
        {
          is_resource_termination_date_required: true,
          default_resource_termination_offset_in_days: 90,
          latest_date_for_resource_termination: '2031-02-01',
        },
        { now: NOW },
      );
      expect(result.maxDate).toBe('2031-02-01');
    });

    it('uses earlier of max offset and latest date when both are set (offset is earlier)', () => {
      const result = getTerminationDateProps(
        {
          is_resource_termination_date_required: true,
          default_resource_termination_offset_in_days: 90,
          max_resource_termination_offset_in_days: 30,
          latest_date_for_resource_termination: '2031-02-01',
        },
        { now: NOW },
      );
      expect(result.maxDate).toBe('2026-08-23'); // 2026-07-24 + 30 days
    });

    it('uses earlier of max offset and latest date when both are set (latest date is earlier)', () => {
      const result = getTerminationDateProps(
        {
          is_resource_termination_date_required: true,
          default_resource_termination_offset_in_days: 90,
          max_resource_termination_offset_in_days: 3650,
          latest_date_for_resource_termination: '2027-01-01',
        },
        { now: NOW },
      );
      expect(result.maxDate).toBe('2027-01-01');
    });

    it('caps max and default at project end date', () => {
      const result = getTerminationDateProps(
        {
          is_resource_termination_date_required: true,
          default_resource_termination_offset_in_days: 90,
          max_resource_termination_offset_in_days: 120,
        },
        { now: NOW, projectEndDate: '2026-12-04' },
      );
      // today+90 = Oct 22, today+120 ≈ Nov 21 — both before project end
      expect(result.defaultDate).toBe('2026-10-22');
      expect(result.maxDate).toBe('2026-11-21');
    });

    it('clamps default to project end when default offset overshoots', () => {
      const result = getTerminationDateProps(
        {
          is_resource_termination_date_required: true,
          default_resource_termination_offset_in_days: 200,
          max_resource_termination_offset_in_days: 365,
        },
        { now: NOW, projectEndDate: '2026-12-04' },
      );
      expect(result.defaultDate).toBe('2026-12-04');
      expect(result.maxDate).toBe('2026-12-04');
    });
  });

  describe('with future order start date', () => {
    const START = '2026-09-17';

    it('measures offsets from start date and raises minDate', () => {
      const result = getTerminationDateProps(
        {
          is_resource_termination_date_required: true,
          default_resource_termination_offset_in_days: 90,
          max_resource_termination_offset_in_days: 120,
        },
        { now: NOW, startDate: START },
      );
      expect(result.minDate).toBe(START);
      expect(result.defaultDate).toBe('2026-12-16'); // Sep 17 + 90
      expect(result.maxDate).toBe('2027-01-15'); // Sep 17 + 120
    });

    it('allows project end in December when offsets are from September start', () => {
      // Reproduces the client scenario: project Sep 17 – Dec 4, offering 90/120
      const result = getTerminationDateProps(
        {
          is_resource_termination_date_required: true,
          default_resource_termination_offset_in_days: 90,
          max_resource_termination_offset_in_days: 120,
        },
        {
          now: NOW,
          startDate: START,
          projectEndDate: '2026-12-04',
        },
      );
      expect(result.minDate).toBe(START);
      expect(result.maxDate).toBe('2026-12-04');
      expect(result.defaultDate).toBe('2026-12-04'); // Dec 16 clamped to project end
    });

    it('ignores past start dates for offset base', () => {
      const result = getTerminationDateProps(
        {
          is_resource_termination_date_required: true,
          default_resource_termination_offset_in_days: 90,
          max_resource_termination_offset_in_days: 120,
        },
        { now: NOW, startDate: '2026-01-01' },
      );
      expect(result.minDate).toBe('2026-07-24');
      expect(result.defaultDate).toBe('2026-10-22');
      expect(result.maxDate).toBe('2026-11-21');
    });
  });

  describe('edge cases', () => {
    it('handles empty plugin_options', () => {
      const result = getTerminationDateProps({}, { now: NOW });
      expect(result.minDate).toBe('2026-07-24');
      expect(result.maxDate).toBeUndefined();
      expect(result.defaultDate).toBeUndefined();
    });

    it('handles max_resource_termination_offset_in_days = 0 (falsy but explicit)', () => {
      const result = getTerminationDateProps(
        {
          is_resource_termination_date_required: true,
          default_resource_termination_offset_in_days: 90,
          max_resource_termination_offset_in_days: 0,
        },
        { now: NOW },
      );
      expect(result.maxDate).toBeUndefined();
    });
  });
});
