import { describe, expect, it } from 'vitest';
import { ProjectCredit } from 'waldur-js-client';

import {
  creditHasExpired,
  finalCoveredMonth,
  monthlyDraw,
  projectCreditRunway,
  writeOffDate,
} from './creditRunway';

// Local, not UTC — exhaustionDate is formatted in the reader's own calendar,
// so an instant pinned to UTC lands on a different day either side of
// Greenwich and the dated assertions fail off CI rather than on it.
const TODAY = new Date(2026, 7, 14, 12);

/** Only the fields the projection reads; the API sends decimals as strings. */
const credit = (overrides: Partial<Record<string, unknown>> = {}) =>
  ({
    value: '45000.00000',
    spendable_value: '45000.00000',
    consumption_last_month: '2000.00000',
    minimal_consumption: '8000.00000',
    apply_as_minimal_consumption: true,
    ...overrides,
  }) as unknown as ProjectCredit;

describe('monthlyDraw', () => {
  it('takes the floor when usage runs below it', () => {
    // The case the whole fix exists for: compensation records 2,000 because
    // that is all the usage there was, but 8,000 leaves the balance either way.
    const draw = monthlyDraw({
      consumptionLastMonth: 2000,
      minimalConsumption: 8000,
    });
    expect(draw.monthly).toBe(8000);
    expect(draw.floorSetsTheRate).toBe(true);
  });

  it('takes last month when usage runs above the floor', () => {
    const draw = monthlyDraw({
      consumptionLastMonth: 9000,
      minimalConsumption: 8000,
    });
    expect(draw.monthly).toBe(9000);
    expect(draw.floorSetsTheRate).toBe(false);
  });

  it('ignores the floor when the credit does not apply one', () => {
    // minimal_consumption stays populated when the flag is off, so reading the
    // amount without the flag invents a draw that never happens.
    const draw = monthlyDraw({
      consumptionLastMonth: 2000,
      minimalConsumption: 8000,
      applyAsMinimalConsumption: false,
    });
    expect(draw.monthly).toBe(2000);
    expect(draw.floor).toBe(0);
    expect(draw.floorSetsTheRate).toBe(false);
  });

  it('reports no draw when neither figure is set', () => {
    expect(
      monthlyDraw({ consumptionLastMonth: 0, minimalConsumption: 0 }).monthly,
    ).toBe(0);
  });
});

describe('projectCreditRunway', () => {
  it('dates exhaustion by the floor, not by what was compensated', () => {
    // Scenario 02 of the credit_scenarios preset: 45,000 left, drawn at
    // 8,000/month. Reading consumption_last_month alone gave 2,000/month and a
    // date in mid-2028 — sixteen months late, on the one figure people plan
    // against.
    const runway = projectCreditRunway(credit(), TODAY);
    expect(runway.monthlyBurn).toBe(8000);
    expect(runway.burnPerDay).toBeCloseTo(266.67, 2);
    expect(runway.daysRemaining).toBe(168);
    expect(runway.exhaustionDate).toBe('2027-01-29');
  });

  it('measures the runway against what can be drawn, not what was allocated', () => {
    // An allocation capped by the organization balance cannot draw the
    // difference, so the allocation would date the exhaustion far too late.
    const runway = projectCreditRunway(
      credit({ value: '20000.00000', spendable_value: '500.00000' }),
      TODAY,
    );
    expect(runway.daysRemaining).toBe(1);
    expect(runway.exhaustionDate).toBe('2026-08-15');
  });

  it('treats a blocked allocation as no days left rather than unknown', () => {
    const runway = projectCreditRunway(
      credit({ spendable_value: '0.00000' }),
      TODAY,
    );
    expect(runway.daysRemaining).toBe(0);
    expect(runway.exhaustionDate).toBe('2026-08-14');
  });

  it('never projects a date from a negative balance', () => {
    const runway = projectCreditRunway(
      credit({ spendable_value: '-1500.00000' }),
      TODAY,
    );
    expect(runway.daysRemaining).toBe(0);
    expect(runway.exhaustionDate).toBe('2026-08-14');
  });

  it('gives no date at all when nothing is being drawn', () => {
    // A rate of zero would divide into infinity; the card shows nothing rather
    // than a date centuries away.
    const runway = projectCreditRunway(
      credit({ consumption_last_month: '0', minimal_consumption: '0' }),
      TODAY,
    );
    expect(runway.daysRemaining).toBeNull();
    expect(runway.exhaustionDate).toBeNull();
  });

  it('projects nothing once the credit has expired', () => {
    // end_date is the day compensation stops, not a deadline the balance
    // survives to. Projecting a run-out date from a credit that is no longer
    // drawn counts down to something that cannot happen.
    const runway = projectCreditRunway(
      credit({ end_date: '2026-08-01' }),
      TODAY,
    );
    expect(runway.hasExpired).toBe(true);
    expect(runway.monthlyBurn).toBe(0);
    expect(runway.burnPerDay).toBe(0);
    expect(runway.daysRemaining).toBeNull();
    expect(runway.exhaustionDate).toBeNull();
  });

  it('still projects while the credit is inside its last covered month', () => {
    // end_date in the future: July is still being compensated, so the rate and
    // the date it produces are both real.
    const runway = projectCreditRunway(
      credit({ end_date: '2026-12-01' }),
      TODAY,
    );
    expect(runway.hasExpired).toBe(false);
    expect(runway.monthlyBurn).toBe(8000);
  });

  it('treats end_date itself as expired, not as the last day', () => {
    // The 1 Aug run compensates July and leaves the balance standing; from
    // that moment nothing further is drawn.
    expect(creditHasExpired('2026-08-14', TODAY)).toBe(true);
    expect(creditHasExpired('2026-08-15', TODAY)).toBe(false);
    expect(creditHasExpired(null, TODAY)).toBe(false);
  });

  it('names the last covered month and the write-off a month either side', () => {
    expect(finalCoveredMonth('2026-08-01')).toBe('2026-07-01');
    expect(writeOffDate('2026-08-01')).toBe('2026-09-01');
    // January either way, where a naive month arithmetic would wrap wrong.
    expect(finalCoveredMonth('2027-01-01')).toBe('2026-12-01');
    expect(writeOffDate('2026-12-01')).toBe('2027-01-01');
  });

  it('survives a project with no credit at all', () => {
    const runway = projectCreditRunway(null, TODAY);
    expect(runway.monthlyBurn).toBe(0);
    expect(runway.exhaustionDate).toBeNull();
  });

  it('dates exhaustion in the local calendar, not in UTC', () => {
    // toISOString() resolves in UTC, so late evening east of Greenwich reported
    // the previous day — a date the user can see is wrong.
    const lateEvening = new Date('2026-08-14T23:30:00');
    const runway = projectCreditRunway(
      credit({ spendable_value: '8000.00000' }),
      lateEvening,
    );
    expect(runway.daysRemaining).toBe(30);
    expect(runway.exhaustionDate).toBe('2026-09-13');
  });
});
