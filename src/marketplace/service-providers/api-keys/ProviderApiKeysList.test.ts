import { describe, expect, it } from 'vitest';

import { getKeyUsages } from './ProviderApiKeysList';

const thisMonth = `${new Date().toISOString().slice(0, 7)}-01`;

describe('getKeyUsages', () => {
  it('reads each component used this month, by type', () => {
    const readings = getKeyUsages({
      current_usages: { output_tokens: 40, input_tokens: 10 },
      usage_period: thisMonth,
    } as any);
    expect(readings.map((r) => [r.component.type, r.used])).toEqual([
      ['input_tokens', 10],
      ['output_tokens', 40],
    ]);
  });

  it('shows a limited component the key has not used yet', () => {
    const readings = getKeyUsages({
      current_usages: null,
      spending_limits: { token_cost: { month: 50 } },
      usage_period: thisMonth,
    } as any);
    expect(readings).toHaveLength(1);
    expect(readings[0].limit).toBe(50);
    expect(readings[0].used).toBeUndefined();
  });

  it('reads last month as no usage this month', () => {
    expect(
      getKeyUsages({
        current_usages: { token_cost: 12 },
        usage_period: '2000-01-01',
      } as any),
    ).toEqual([]);
  });

  it('names the components of the plan, in the offering order', () => {
    const readings = getKeyUsages(
      {
        current_usages: { output_tokens: 40, input_tokens: 10, retired: 3 },
        usage_period: thisMonth,
      } as any,
      [
        { type: 'output_tokens', name: 'Output tokens', measured_unit: 'tok' },
        { type: 'input_tokens', name: 'Input tokens', measured_unit: 'tok' },
      ],
    );
    expect(
      readings.map((r) => [r.component.type, r.component.name, r.used]),
    ).toEqual([
      ['output_tokens', 'Output tokens', 40],
      ['input_tokens', 'Input tokens', 10],
      // A component the offering no longer has still reads, by its type.
      ['retired', undefined, 3],
    ]);
  });

  it('caps a key without a limit of its own at the resource limit', () => {
    const readings = getKeyUsages(
      {
        current_usages: { token_cost: 20 },
        spending_limits: null,
        usage_period: thisMonth,
      } as any,
      [{ type: 'token_cost', name: 'Token cost', measured_unit: 'USD' }],
      { token_cost: { month: 80 } },
    );
    expect(readings).toHaveLength(1);
    expect(readings[0].limit).toBe(80);
    expect(readings[0].inherited).toBe(true);
    expect(readings[0].ratio).toBe(25);
  });

  it('shows a resource limit on a component the key has not used', () => {
    const readings = getKeyUsages(
      { current_usages: null, usage_period: thisMonth } as any,
      [],
      { token_cost: { month: 80 } },
    );
    expect(readings.map((r) => [r.component.type, r.limit])).toEqual([
      ['token_cost', 80],
    ]);
  });

  it('reads a key outside key management as nothing', () => {
    expect(
      getKeyUsages({ current_usages: null, spending_limits: null } as any),
    ).toEqual([]);
  });
});
