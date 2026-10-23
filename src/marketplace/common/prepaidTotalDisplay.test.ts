import { Settings } from 'luxon';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  formatMonthCount,
  getPrepaidDurationMonths,
  getPrepaidTotalComponentTypes,
  showsPrepaidLimitsAsTotal,
} from './prepaidTotalDisplay';

describe('showsPrepaidLimitsAsTotal', () => {
  it('is off unless the offering turns it on', () => {
    expect(showsPrepaidLimitsAsTotal(undefined)).toBe(false);
    expect(showsPrepaidLimitsAsTotal(null)).toBe(false);
    expect(showsPrepaidLimitsAsTotal({})).toBe(false);
    expect(
      showsPrepaidLimitsAsTotal({ display_prepaid_limits_as_total: false }),
    ).toBe(false);
    expect(
      showsPrepaidLimitsAsTotal({ display_prepaid_limits_as_total: true }),
    ).toBe(true);
  });
});

describe('getPrepaidTotalComponentTypes', () => {
  it('lists what the backend names, and nothing otherwise', () => {
    expect(getPrepaidTotalComponentTypes(undefined)).toEqual([]);
    expect(getPrepaidTotalComponentTypes({})).toEqual([]);
    expect(
      getPrepaidTotalComponentTypes({ prepaid_total_component_types: ['cpu'] }),
    ).toEqual(['cpu']);
  });
});

describe('getPrepaidDurationMonths', () => {
  it('counts whole months from creation to the end date', () => {
    expect(
      getPrepaidDurationMonths('2026-08-15T10:00:00+00:00', '2026-10-15'),
    ).toBe(2);
  });

  // The agent rounds a partial month up, so the portal must too or it shows a
  // smaller total than the one the cluster enforces.
  it('rounds a partial month up', () => {
    expect(
      getPrepaidDurationMonths('2026-08-15T10:00:00+00:00', '2026-10-20'),
    ).toBe(3);
  });

  it('never counts fewer than one month', () => {
    expect(
      getPrepaidDurationMonths('2026-08-15T10:00:00+00:00', '2026-08-20'),
    ).toBe(1);
  });

  describe('for a viewer ahead of UTC', () => {
    const viewerZone = Settings.defaultZone;
    beforeEach(() => {
      Settings.defaultZone = 'Europe/Tallinn';
    });
    afterEach(() => {
      Settings.defaultZone = viewerZone;
    });

    // Created late on 14 Aug UTC is already 15 Aug in Tallinn. The agent
    // counts from the 14th, so 15 Nov rounds up to a fourth month; read in
    // the viewer's zone it would be three.
    it('keeps the stored calendar day', () => {
      expect(
        getPrepaidDurationMonths('2026-08-14T23:30:00+00:00', '2026-11-15'),
      ).toBe(4);
    });
  });

  it('has no answer without both dates', () => {
    expect(getPrepaidDurationMonths(undefined, '2026-10-15')).toBeUndefined();
    expect(getPrepaidDurationMonths('2026-08-15', null)).toBeUndefined();
  });
});

describe('formatMonthCount', () => {
  it('counts one month in the singular', () => {
    expect(formatMonthCount(1)).toBe('1 month');
    expect(formatMonthCount(3)).toBe('3 months');
  });
});
