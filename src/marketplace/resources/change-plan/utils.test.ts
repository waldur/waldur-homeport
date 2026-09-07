import { describe, expect, it } from 'vitest';
import { Offering, OrderDetails } from 'waldur-js-client';

import { getBilledLimits, getPlanSwitchData } from './utils';

const limitPlan = {
  uuid: 'limit',
  name: 'Reserved',
  unit: 'month',
  billing_mode: 'inherit',
  prices: { cores: '10', ram: '1' },
  components: [
    { type: 'cores', billing_type: 'limit', measured_unit: 'cores' },
    { type: 'ram', billing_type: 'limit', measured_unit: 'GB' },
  ],
};

const usagePlan = {
  uuid: 'usage',
  name: 'Pay as you go',
  unit: 'month',
  billing_mode: 'usage',
  prices: { cores: '0.5', ram: '0.1' },
  components: [
    { type: 'cores', billing_type: 'usage', measured_unit: 'core-hours' },
    { type: 'ram', billing_type: 'usage', measured_unit: 'GB-hours' },
  ],
};

const offering = {
  type: 'Basic',
  plans: [limitPlan, usagePlan],
  components: [
    {
      type: 'cores',
      name: 'Cores',
      billing_type: 'limit',
      measured_unit: 'cores',
      is_builtin: true,
    },
    {
      type: 'ram',
      name: 'RAM',
      billing_type: 'limit',
      measured_unit: 'GB',
      is_builtin: true,
    },
  ],
} as unknown as Offering;

describe('getPlanSwitchData', () => {
  it('prices a limit-to-usage switch per side', () => {
    const order = {
      old_plan_uuid: 'limit',
      new_plan_uuid: 'usage',
      limits: { cores: 4, ram: 8 },
    } as unknown as OrderDetails;
    const data = getPlanSwitchData(order, offering);
    const cores = data.components.find((c) => c.type === 'cores');
    expect(cores.oldBillingType).toBe('limit');
    expect(cores.newBillingType).toBe('usage');
    expect(cores.oldSubTotal).toBe(40);
    expect(cores.newSubTotal).toBe(0);
    expect(cores.newPrice).toBe(0.5);
    expect(cores.newMeasuredUnit).toBe('core-hours');
    expect(cores.bothLimit).toBe(false);
    expect(cores.changedSubTotal).toBe(0);
    expect(data.hasUsageSide).toBe(true);
    expect(data.totalPeriods[0]).toBe(48);
  });

  it('keeps the difference when both plans are limit-based', () => {
    const cheaper = {
      ...limitPlan,
      uuid: 'cheap',
      prices: { cores: '5', ram: '1' },
    };
    const order = {
      old_plan_uuid: 'limit',
      new_plan_uuid: 'cheap',
      limits: { cores: 4, ram: 8 },
    } as unknown as OrderDetails;
    const data = getPlanSwitchData(order, {
      ...offering,
      plans: [limitPlan, cheaper],
    } as unknown as Offering);
    const cores = data.components.find((c) => c.type === 'cores');
    expect(cores.bothLimit).toBe(true);
    expect(cores.changedSubTotal).toBe(-20);
    expect(data.hasUsageSide).toBe(false);
  });
});

describe('getBilledLimits', () => {
  it('lists the limits a limit plan bills, priced with that plan', () => {
    const rows = getBilledLimits(offering, limitPlan as any, {
      cores: 4,
      ram: 8,
    });
    expect(rows).toEqual([
      {
        name: 'Cores',
        limit: 4,
        measured_unit: 'cores',
        price: 10,
        subTotal: 40,
      },
      { name: 'RAM', limit: 8, measured_unit: 'GB', price: 1, subTotal: 8 },
    ]);
  });

  it('is empty for a usage plan', () => {
    expect(getBilledLimits(offering, usagePlan as any, { cores: 4 })).toEqual(
      [],
    );
  });
});
