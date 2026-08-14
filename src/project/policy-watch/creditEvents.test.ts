import { describe, expect, it } from 'vitest';

import { buildCreditEvents, CreditEventInput } from './creditEvents';

const TODAY = new Date('2026-08-14T00:00:00Z');

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

  it('says the credit expiry forfeits the balance and waives the grace', () => {
    const [expiry] = build({ creditEndDate: '2026-09-01' });
    expect(expiry.kind).toBe('credit-expiry');
    expect(expiry.consequence).toContain('forfeited');
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

  it('still projects exhaustion when the organization only caps the allocation', () => {
    const events = build({
      spendableValue: 500,
      isLimitedByOrganizationCredit: true,
    });
    expect(kinds(events)).toEqual(['exhaustion']);
  });
});
