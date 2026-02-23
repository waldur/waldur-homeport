import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';

import { getTerminationDateProps } from './TerminationDateField';

const NOW = DateTime.fromISO('2026-02-23');

describe('getTerminationDateProps', () => {
  it('sets minDate to 1 week from now when not required', () => {
    const result = getTerminationDateProps(undefined, NOW);
    expect(result.minDate).toBe('2026-03-02');
    expect(result.maxDate).toBeUndefined();
    expect(result.defaultDate).toBeUndefined();
    expect(result.isClearable).toBeUndefined();
  });

  it('sets minDate to 1 week from now when required is false', () => {
    const result = getTerminationDateProps(
      { is_resource_termination_date_required: false },
      NOW,
    );
    expect(result.minDate).toBe('2026-03-02');
    expect(result.maxDate).toBeUndefined();
    expect(result.defaultDate).toBeUndefined();
  });

  describe('when termination date is required', () => {
    it('sets defaultDate from offset and no maxDate when only default offset is set', () => {
      const result = getTerminationDateProps(
        {
          is_resource_termination_date_required: true,
          default_resource_termination_offset_in_days: 90,
        },
        NOW,
      );
      expect(result.minDate).toBe('2026-03-02');
      expect(result.defaultDate).toBe('2026-05-24'); // 2026-02-23 + 90 days
      expect(result.maxDate).toBeUndefined();
      expect(result.isClearable).toBe(false);
    });

    it('does not set maxDate when max_resource_termination_offset_in_days is undefined (bug fix)', () => {
      // This was the original bug: undefined maxOffsetDays caused
      // maxDate = today, which is before minDate = today + 1 week
      const result = getTerminationDateProps(
        {
          is_resource_termination_date_required: true,
          default_resource_termination_offset_in_days: 90,
          max_resource_termination_offset_in_days: undefined,
        },
        NOW,
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
        NOW,
      );
      expect(result.maxDate).toBe('2026-08-22'); // 2026-02-23 + 180 days
    });

    it('sets maxDate from latest_date_for_resource_termination when only that is set', () => {
      const result = getTerminationDateProps(
        {
          is_resource_termination_date_required: true,
          default_resource_termination_offset_in_days: 90,
          latest_date_for_resource_termination: '2031-02-01',
        },
        NOW,
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
        NOW,
      );
      expect(result.maxDate).toBe('2026-03-25'); // 2026-02-23 + 30 days (earlier)
    });

    it('uses earlier of max offset and latest date when both are set (latest date is earlier)', () => {
      const result = getTerminationDateProps(
        {
          is_resource_termination_date_required: true,
          default_resource_termination_offset_in_days: 90,
          max_resource_termination_offset_in_days: 3650,
          latest_date_for_resource_termination: '2027-01-01',
        },
        NOW,
      );
      expect(result.maxDate).toBe('2027-01-01'); // latest date is earlier than +3650 days
    });

    it('reproduces the production bug scenario: required=true, default=90, no max offset, latest=2031', () => {
      // This is the exact configuration from the DigiDefense Slurm cluster offering
      const result = getTerminationDateProps(
        {
          is_resource_termination_date_required: true,
          default_resource_termination_offset_in_days: 90,
          latest_date_for_resource_termination: '2031-02-01',
        },
        NOW,
      );
      expect(result.minDate).toBe('2026-03-02');
      expect(result.defaultDate).toBe('2026-05-24');
      expect(result.maxDate).toBe('2031-02-01');
      expect(result.isClearable).toBe(false);
      // Critical: maxDate must be after minDate for the date picker to work
      expect(result.maxDate > result.minDate).toBe(true);
    });

    it('ensures maxDate is always after minDate when max offset is set', () => {
      const result = getTerminationDateProps(
        {
          is_resource_termination_date_required: true,
          default_resource_termination_offset_in_days: 90,
          max_resource_termination_offset_in_days: 60,
        },
        NOW,
      );
      // minDate = 2026-03-02, maxDate = 2026-04-24 (60 days from now)
      expect(result.maxDate > result.minDate).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('handles empty plugin_options', () => {
      const result = getTerminationDateProps({}, NOW);
      expect(result.minDate).toBe('2026-03-02');
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
        NOW,
      );
      // 0 is falsy, so maxDate should not be set from offset
      expect(result.maxDate).toBeUndefined();
    });
  });
});
