import { describe, expect, it } from 'vitest';

import { buildCreditEvents, CreditEventInput } from './creditEvents';

// Local midnight, not an instant pinned to UTC: the event dates are formatted
// in the reader's own calendar, so a UTC-anchored fixture resolves to the 13th
// for anyone west of Greenwich and the dated assertions below fail on their
// machine but not in CI.
const TODAY = new Date(2026, 7, 14);

const base: CreditEventInput = {
  balance: 60000,
  spendableValue: 60000,
  isLimitedByOrganizationCredit: false,
  exhaustionDate: '2027-02-10',
  burnPerDay: 333.33,
  creditEndDate: null,
  project: null,
  resources: [],
};

const build = (overrides: Partial<CreditEventInput> = {}) =>
  buildCreditEvents({ ...base, ...overrides }, TODAY);

const kinds = (events: ReturnType<typeof build>) => events.map((e) => e.kind);

describe('buildCreditEvents', () => {
  it('lists an exhaustion date on its own for a project with no deadlines', () => {
    const events = build();
    expect(kinds(events)).toEqual(['exhaustion']);
    expect(events[0].consequence).toContain('resources keep running');
  });

  it('orders events soonest first', () => {
    const events = build({
      creditEndDate: '2026-10-01',
      exhaustionDate: '2027-02-10',
    });
    expect(kinds(events)).toEqual(['credit-expiry', 'exhaustion']);
  });

  it('dates the expiry on end_date and names the month before it as the last', () => {
    // Verified against mastermind: with end_date = 1 Aug, the 1 Aug run
    // finalizes July's invoice and compensates it (the credit survives, since
    // the filter is end_date__lt=effective_date and effective_date is the 1st);
    // the 1 Sep run zeroes the credit before August's compensation, so August
    // gets nothing. July is the last covered month.
    const [expiry] = build({
      exhaustionDate: null,
      creditEndDate: '2026-10-01',
    });
    expect(expiry.kind).toBe('credit-expiry');
    expect(expiry.date).toBe('2026-10-01');
    expect(expiry.title).toBe('Credit expires');
    expect(expiry.consequence).toContain('September 2026');
    expect(expiry.consequence).toContain('1 Nov 2026');
  });

  it('reports an expired credit as expired, and names the residue', () => {
    // The case that read as "16 days ago" under a label saying the money was
    // gone, while the balance was still on screen. Both halves are true and
    // neither replaces the other: compensation stopped on 1 Aug, and the
    // balance shown is written off on 1 Sep.
    const [expiry] = build({
      balance: 22000,
      exhaustionDate: null,
      creditEndDate: '2026-08-01',
    });
    expect(expiry.date).toBe('2026-08-01');
    expect(expiry.title).toBe('Credit has expired');
    expect(expiry.consequence).toContain('July 2026');
    expect(expiry.consequence).toContain('written off');
    expect(expiry.consequence).toContain('1 Sep 2026');
    // No claim that any of it is still spendable.
    expect(expiry.consequence).not.toContain('can still be spent');
  });

  it('binds on the soonest event that stops something, not on the balance', () => {
    // The balance empties first, but that only ends compensation — the credit
    // expiry is what actually takes the money away.
    const events = build({
      exhaustionDate: '2026-09-01',
      creditEndDate: '2026-12-01',
    });
    expect(events.map((e) => [e.kind, e.isBinding])).toEqual([
      ['exhaustion', false],
      ['credit-expiry', true],
    ]);
  });

  it('falls back to the first event when nothing stops the work', () => {
    const events = build();
    expect(events[0].isBinding).toBe(true);
  });

  it('says the credit expiry writes off the balance and waives the grace', () => {
    const [expiry] = build({ creditEndDate: '2026-09-01' });
    expect(expiry.kind).toBe('credit-expiry');
    expect(expiry.consequence).toContain('written off');
    expect(expiry.consequence).toContain('grace coefficient');
  });

  it('splits a project end date into the pause and the termination', () => {
    const events = build({
      exhaustionDate: null,
      project: {
        end_date: '2026-08-26',
        effective_end_date: '2026-09-25',
        is_in_grace_period: false,
      },
    });
    expect(kinds(events)).toEqual(['project-pause', 'project-end']);
    expect(events[0].date).toBe('2026-08-26');
    expect(events[0].consequence).toContain('paused');
    expect(events[1].date).toBe('2026-09-25');
    expect(events[1].consequence).toContain('terminated');
  });

  it('keeps a project end date as one event when there is no grace period', () => {
    const events = build({
      exhaustionDate: null,
      project: { end_date: '2026-08-26', effective_end_date: '2026-08-26' },
    });
    expect(kinds(events)).toEqual(['project-end']);
    expect(events[0].title).toBe('Project ends');
  });

  it('uses the effective resource end date, not the raw one', () => {
    // The raw date is earlier, but the project grace period pushes the actual
    // termination out; planning against the raw date would be wrong.
    const events = build({
      exhaustionDate: null,
      resources: [
        { end_date: '2026-09-01', resource_effective_end_date: '2026-10-01' },
      ],
    });
    expect(kinds(events)).toEqual(['resources-end']);
    expect(events[0].date).toBe('2026-10-01');
  });

  it('reports the last resource to end, not the first', () => {
    const events = build({
      exhaustionDate: null,
      resources: [
        { resource_effective_end_date: '2026-09-01' },
        { resource_effective_end_date: '2027-01-15' },
      ],
    });
    expect(events[0].date).toBe('2027-01-15');
  });

  it('does not claim the work ends while one resource is open-ended', () => {
    const events = build({
      exhaustionDate: null,
      resources: [
        { resource_effective_end_date: '2026-09-01' },
        { resource_effective_end_date: null, end_date: null },
      ],
    });
    expect(kinds(events)).toEqual([]);
  });

  it('drops the resource row when a project end date already terminates everything', () => {
    const events = build({
      exhaustionDate: null,
      project: { end_date: '2026-12-01', effective_end_date: '2026-12-01' },
      resources: [{ resource_effective_end_date: '2026-11-01' }],
    });
    expect(kinds(events)).toEqual(['project-end']);
  });

  it('reports an exhausted organization credit as already in effect', () => {
    const events = build({
      spendableValue: 0,
      isLimitedByOrganizationCredit: true,
      exhaustionDate: '2026-08-14',
    });
    expect(kinds(events)).toEqual(['blocked']);
    expect(events[0].date).toBe('2026-08-14');
    expect(events[0].consequence).toContain('uncompensated');
  });

  it('dates a policy estimate so it sorts against the scheduled events', () => {
    // "~45 days" cannot be ordered against absolute dates by eye, which is how
    // a sooner policy ends up printed below a later deadline.
    const events = build({
      exhaustionDate: '2026-12-01',
      policies: [{ actionLabel: 'Notify organization owners', etaDays: 45 }],
    });
    expect(kinds(events)).toEqual(['policy', 'exhaustion']);
    expect(events[0].date).toBe('2026-09-28');
    expect(events[0].approximate).toBe(true);
  });

  it('ignores policies with no estimate and those already fired', () => {
    const events = build({
      exhaustionDate: null,
      policies: [
        { actionLabel: 'No estimate', etaDays: null },
        { actionLabel: 'Threshold reached', etaDays: 0 },
      ],
    });
    expect(kinds(events)).toEqual([]);
  });

  it('says an organization-wide cap is not driven by this project alone', () => {
    const [event] = build({
      exhaustionDate: null,
      policies: [
        {
          actionLabel: 'Request pausing',
          etaDays: 20,
          kind: 'customer-cost',
          scopeName: 'Credit scenarios',
        },
      ],
    });
    expect(event.kind).toBe('policy');
    expect(event.consequence).toContain('Credit scenarios');
    expect(event.consequence).toContain('every project under it');
  });

  it('never binds on a policy estimate', () => {
    const events = build({
      exhaustionDate: null,
      creditEndDate: '2027-01-01',
      policies: [{ actionLabel: 'Request downscaling', etaDays: 10 }],
    });
    expect(events.map((e) => [e.kind, e.isBinding])).toEqual([
      ['policy', false],
      ['credit-expiry', true],
    ]);
  });

  it('flags a partly capped allocation, and still projects exhaustion', () => {
    const events = build({
      spendableValue: 500,
      isLimitedByOrganizationCredit: true,
    });
    expect(kinds(events)).toEqual(['blocked', 'exhaustion']);
    expect(events[0].title).toBe('Only part of the allocation can be drawn');
    expect(events[0].consequence).toContain('only that much');
    // The projection is about the organization's balance, not this allocation,
    // which is shown untouched beside it.
    expect(events[1].title).toBe('Organization credit runs out');
    expect(events[1].consequence).toContain('still drawable');
  });

  it('drops the exhaustion projection when nothing can be drawn', () => {
    // With no drawable balance the rate is meaningless, and the blocked row
    // already says what is happening.
    const events = build({
      spendableValue: 0,
      isLimitedByOrganizationCredit: true,
      exhaustionDate: '2026-08-14',
    });
    expect(kinds(events)).toEqual(['blocked']);
  });

  it('still reports a project that has drawn its own allocation to zero', () => {
    // Nothing drawable, but the organization is not the reason — there is no
    // blocked row to carry the news, so dropping the projection here would
    // leave an empty credit reading "Nothing is scheduled to end".
    const events = build({
      balance: 0,
      spendableValue: 0,
      isLimitedByOrganizationCredit: false,
      exhaustionDate: '2026-08-14',
    });
    expect(kinds(events)).toEqual(['exhaustion']);
    expect(events[0].title).toBe('Credit balance is empty');
  });
});
