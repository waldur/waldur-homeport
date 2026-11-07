import { describe, expect, it } from 'vitest';
import { OfferingComponent } from 'waldur-js-client';

import { needsOfferingManagers, offeringTeamLink } from './providerCalls';
import { formatRequestedLimits, getRequestedLines } from './requestedLines';

const row = (values: {
  offering_managers_count?: number;
  team_steps_count?: number;
  state?: 'requested' | 'accepted' | 'canceled';
}) => ({
  offering_managers_count: 0,
  team_steps_count: 2,
  state: 'accepted' as const,
  ...values,
});

describe('needsOfferingManagers', () => {
  it('asks for managers when the call hands the team steps and it has none', () => {
    expect(needsOfferingManagers(row({}))).toBe(true);
    expect(needsOfferingManagers(row({ state: 'requested' }))).toBe(true);
  });

  it('is quiet once someone manages the offering', () => {
    expect(needsOfferingManagers(row({ offering_managers_count: 1 }))).toBe(
      false,
    );
  });

  it('is quiet when no step needs the team', () => {
    expect(needsOfferingManagers(row({ team_steps_count: 0 }))).toBe(false);
  });

  it('is quiet for a request that was rejected', () => {
    expect(needsOfferingManagers(row({ state: 'canceled' }))).toBe(false);
  });
});

describe('offeringTeamLink', () => {
  it('opens the offering on its Team tab', () => {
    expect(offeringTeamLink('provider-1', 'offering-1')).toEqual({
      state: 'marketplace-offering-details',
      params: {
        uuid: 'provider-1',
        offering_uuid: 'offering-1',
        tab: 'permissions',
      },
    });
  });
});

const components = [
  {
    type: 'cpu_hours',
    name: 'CPU Core Hours',
    measured_unit: 'hours',
    limit_period: 'total',
  },
  {
    type: 'support_hours',
    name: 'Dedicated support',
    measured_unit: 'hours',
    limit_period: 'month',
  },
  {
    type: 'gpu_hours',
    name: 'GPU Hours',
    measured_unit: 'hours',
    limit_period: 'total',
  },
] as OfferingComponent[];

describe('getRequestedLines', () => {
  it('names the components in the offering order, with their units', () => {
    expect(
      getRequestedLines(
        { gpu_hours: 25000, support_hours: 10, cpu_hours: 400000 },
        components,
      ),
    ).toEqual([
      {
        key: 'cpu_hours',
        label: 'CPU Core Hours',
        amount: 400000,
        unit: 'hours',
      },
      {
        key: 'support_hours',
        label: 'Dedicated support',
        amount: 10,
        unit: 'hours per month',
      },
      { key: 'gpu_hours', label: 'GPU Hours', amount: 25000, unit: 'hours' },
    ]);
  });

  it('keeps a component the offering no longer lists, by its type', () => {
    expect(getRequestedLines({ ram_gb: 4 }, components)).toEqual([
      { key: 'ram_gb', label: 'ram_gb', amount: 4, unit: '' },
    ]);
  });

  it('is empty without limits', () => {
    expect(getRequestedLines(null, components)).toEqual([]);
  });
});

describe('formatRequestedLimits', () => {
  it('lists each component in full for export', () => {
    expect(
      formatRequestedLimits({ cpu_hours: 400000, gpu_hours: 25 }, components),
    ).toBe('CPU Core Hours: 400,000 hours; GPU Hours: 25 hours');
  });

  it('is empty without limits', () => {
    expect(formatRequestedLimits(null, components)).toBe('');
  });
});
