import { describe, expect, it } from 'vitest';
import { OfferingDemand, OfferingDemandComponent } from 'waldur-js-client';

import {
  callFilterParam,
  componentRows,
  describePoolLeft,
  formatDemandAmount,
  groupDemandRows,
  roundOptions,
} from './offeringDemand';

const component = (
  values: Partial<OfferingDemandComponent> = {},
): OfferingDemandComponent => ({
  type: 'gpu_hours',
  name: 'GPU hours',
  measured_unit: 'hours',
  limit_period: 'total',
  requested: 0,
  awarded: null,
  call_pool: null,
  round_pool: null,
  ...values,
});

const demand = (values: Partial<OfferingDemand> = {}): OfferingDemand => ({
  offering_uuid: 'o1',
  offering_name: 'Booster',
  provider_uuid: 'p1',
  provider_name: 'South',
  requested_offering_uuid: 'ro1',
  call_uuid: 'c1',
  call_name: 'Extreme Scale',
  call_state: 'active',
  round_uuid: 'r1',
  round_name: 'Spring',
  round_start_time: '2026-03-01T00:00:00Z',
  round_cutoff_time: '2026-04-01T00:00:00Z',
  round_status: 'ended',
  state_group: 'pending',
  proposals_count: 1,
  components: [],
  ...values,
});

describe('demand formatting', () => {
  it('writes amounts compactly in the component unit', () => {
    expect(formatDemandAmount(1_200_000, 'hours')).toBe('1.2M hours');
    expect(formatDemandAmount(900, '')).toBe('900');
    expect(formatDemandAmount(null, 'hours')).toBe('');
  });

  it('says what a pool has left of what it offers', () => {
    expect(
      describePoolLeft({
        offered: 2_000_000,
        awarded: 1_400_000,
        remaining: 600_000,
      }),
    ).toBe('600K of 2M left');
  });

  it('carries a call into the Demand page filter', () => {
    expect(callFilterParam('c1', 'Extreme Scale')).toBe('c1::Extreme Scale');
  });
});

describe('groupDemandRows', () => {
  const rows = [
    demand({
      state_group: 'pending',
      proposals_count: 2,
      components: [component({ requested: 30_000 })],
    }),
    demand({
      state_group: 'accepted',
      components: [component({ requested: 30_000, awarded: 20_000 })],
    }),
    demand({ state_group: 'closed', proposals_count: 3 }),
    demand({
      round_uuid: 'r2',
      round_name: 'Autumn',
      components: [component({ requested: 25_000 })],
    }),
    demand({
      offering_uuid: 'o2',
      offering_name: 'Cluster',
      requested_offering_uuid: 'ro2',
      components: [
        component({ type: 'cpu_hours', name: 'CPU hours', requested: 400 }),
      ],
    }),
  ];

  it('puts the groups of a round side by side', () => {
    const grouped = groupDemandRows(rows);
    expect(grouped.map((row) => row.key)).toEqual([
      'ro1:r1',
      'ro1:r2',
      'ro2:r1',
    ]);
    expect(grouped[0].pending.proposals_count).toBe(2);
    expect(grouped[0].accepted.components[0].awarded).toBe(20_000);
    expect(grouped[0].closed.proposals_count).toBe(3);
    expect(grouped[1].accepted).toBeNull();
  });

  it('sets each component of a round out side by side, with its pools', () => {
    const pool = { offered: 50_000, awarded: 20_000, remaining: 30_000 };
    const [row] = groupDemandRows([
      demand({
        components: [
          component({ requested: 25_000, round_pool: pool }),
          component({ type: 'cpu', name: 'CPU hours' }),
        ],
      }),
      demand({
        state_group: 'accepted',
        components: [
          component({ requested: 30_000, awarded: 20_000, round_pool: pool }),
        ],
      }),
    ]);
    expect(componentRows(row)).toEqual([
      {
        type: 'gpu_hours',
        label: 'GPU hours',
        unit: 'hours',
        pendingRequested: 25_000,
        acceptedRequested: 30_000,
        awarded: 20_000,
        roundPool: pool,
        callPool: null,
      },
    ]);
  });

  it('offers each round once, named with its call', () => {
    expect(roundOptions(rows)).toEqual([
      { value: 'r1', label: 'Extreme Scale · Spring' },
      { value: 'r2', label: 'Extreme Scale · Autumn' },
    ]);
  });
});
