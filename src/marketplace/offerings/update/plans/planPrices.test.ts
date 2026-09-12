import { describe, expect, it } from 'vitest';

import {
  getEnteredPrices,
  getPlanComponentsForMode,
  getPlanPriceStatus,
  isPricingIncomplete,
  toPriceValues,
} from './planPrices';

const components = [
  {
    type: 'cores',
    name: 'Cores',
    measured_unit: 'cores',
    billing_type: 'limit',
  },
  { type: 'ram', name: 'RAM', measured_unit: 'GB', billing_type: 'limit' },
] as any;

describe('toPriceValues', () => {
  it('gives every component a value when editing, 0 where none is stored', () => {
    expect(
      toPriceValues({ cores: '5.0000000' }, components, { keepZeros: true }),
    ).toEqual({ cores: 5, ram: 0 });
  });

  it('drops a price whose component the offering no longer has', () => {
    expect(
      toPriceValues({ cores: '5', gone: '3' }, components, {
        keepZeros: true,
      }),
    ).toEqual({ cores: 5, ram: 0 });
  });

  it('leaves zeros blank when creating, so they read as not priced', () => {
    expect(
      toPriceValues({ cores: '5', ram: '0' }, components, { keepZeros: false }),
    ).toEqual({ cores: 5 });
  });
});

describe('getPlanPriceStatus', () => {
  it('flags a plan whose components are all priced at zero', () => {
    const status = getPlanPriceStatus(
      { prices: { cores: '0.00', ram: '0E-10' } } as any,
      components,
    );

    expect(status.isUnpriced).toBe(true);
    expect(status.priced).toHaveLength(0);
    expect(status.unpriced.map((c) => c.type)).toEqual(['cores', 'ram']);
  });

  it('splits priced components from the ones that charge nothing', () => {
    const status = getPlanPriceStatus(
      { prices: { cores: '0.02', ram: '0' } } as any,
      components,
    );

    expect(status.isUnpriced).toBe(false);
    expect(status.priced).toEqual([{ component: components[0], price: 0.02 }]);
    expect(status.unpriced.map((c) => c.type)).toEqual(['ram']);
  });

  it('treats a component the plan does not price at all as unpriced', () => {
    const status = getPlanPriceStatus({ prices: {} } as any, components);

    expect(status.isUnpriced).toBe(true);
  });

  it('does not flag an offering that has no components', () => {
    const status = getPlanPriceStatus({ prices: {} } as any, []);

    expect(status.isUnpriced).toBe(false);
  });
});

describe('getPlanComponentsForMode', () => {
  const usagePlan = {
    billing_mode: 'usage',
    components: [
      { type: 'cores', billing_type: 'usage', measured_unit: 'core-hours' },
      { type: 'ram', billing_type: 'usage', measured_unit: 'GB-hours' },
    ],
  } as any;

  it('keeps the offering components when the plan inherits its billing', () => {
    const result = getPlanComponentsForMode(
      { components },
      [usagePlan],
      'inherit',
    );

    expect(result).toEqual(components);
  });

  it('takes the units from a plan that already carries the mode', () => {
    const result = getPlanComponentsForMode(
      { components },
      [usagePlan],
      'usage',
    );

    expect(result.map((c) => c.measured_unit)).toEqual([
      'core-hours',
      'GB-hours',
    ]);
  });

  it('takes the units the backend resolved for a mode no plan carries', () => {
    const result = getPlanComponentsForMode(
      {
        components,
        billing_mode_components: {
          usage: [
            {
              type: 'cores',
              billing_type: 'usage',
              measured_unit: 'core-hours',
            },
            { type: 'ram', billing_type: 'usage', measured_unit: 'GB-hours' },
          ],
        },
      } as any,
      [],
      'usage',
    );

    expect(result.map((c) => [c.billing_type, c.measured_unit])).toEqual([
      ['usage', 'core-hours'],
      ['usage', 'GB-hours'],
    ]);
  });

  it('drops the unit of a builtin when no plan carries the mode yet', () => {
    const builtins = components.map((c) => ({ ...c, is_builtin: true }));
    const result = getPlanComponentsForMode(
      { components: builtins },
      [],
      'usage',
    );

    expect(result.map((c) => c.measured_unit)).toEqual([undefined, undefined]);
  });

  it('still bills the builtin components as the chosen mode says', () => {
    const custom = { ...components[1], type: 'support', is_builtin: false };
    const result = getPlanComponentsForMode(
      { components: [{ ...components[0], is_builtin: true }, custom] } as any,
      [],
      'usage',
    );

    expect(result.map((c) => c.billing_type)).toEqual(['usage', 'limit']);
  });
});

describe('getEnteredPrices', () => {
  it('keeps the prices that were typed, including a deliberate zero', () => {
    expect(getEnteredPrices({ cores: 0.02, ram: 0 })).toEqual({
      cores: '0.02',
      ram: '0',
    });
  });

  it('leaves out the components nothing was typed for', () => {
    expect(
      getEnteredPrices({ cores: 0.02, ram: undefined, storage: '' }),
    ).toEqual({ cores: '0.02' });
  });

  it('returns nothing for an untouched form', () => {
    expect(getEnteredPrices(undefined)).toEqual({});
  });
});

describe('isPricingIncomplete', () => {
  const offering = { components, plans: [], billable: true } as any;

  it('holds a plan that is neither priced nor declared free', () => {
    expect(isPricingIncomplete(offering, 'inherit', {})).toBe(true);
    expect(
      isPricingIncomplete(offering, 'inherit', { prices: { cores: 0 } }),
    ).toBe(true);
  });

  it('lets through a plan that charges for something', () => {
    expect(
      isPricingIncomplete(offering, 'inherit', { prices: { cores: 0.02 } }),
    ).toBe(false);
  });

  it('lets through a plan the provider declared free', () => {
    expect(isPricingIncomplete(offering, 'inherit', { is_free: true })).toBe(
      false,
    );
  });

  it('does not ask an offering nothing is invoiced for', () => {
    expect(
      isPricingIncomplete({ ...offering, billable: false }, 'inherit', {}),
    ).toBe(false);
  });

  it('does not ask an offering with no components to price', () => {
    expect(isPricingIncomplete({ components: [] } as any, 'inherit', {})).toBe(
      false,
    );
  });
});
