import { describe, expect, it } from 'vitest';
import { OfferingComponent, PublicOfferingDetails } from 'waldur-js-client';

import {
  findResourcePlan,
  getEffectiveComponents,
  resolvePlanComponents,
} from './effectiveComponents';

const component = (
  type: string,
  billing_type: string,
  extra: Partial<OfferingComponent> = {},
): OfferingComponent =>
  ({
    type,
    name: type,
    billing_type,
    measured_unit: 'GB',
    is_prepaid: false,
    limit_period: 'month',
    is_builtin: true,
    ...extra,
  }) as OfferingComponent;

describe('resolvePlanComponents', () => {
  const components = [
    component('cores', 'limit', { measured_unit: 'cores' }),
    component('ram', 'limit'),
    component('consultancy', 'usage', {
      measured_unit: 'hours',
      is_builtin: false,
    }),
  ];

  it('keeps the offering values without a plan', () => {
    expect(resolvePlanComponents(components, null)).toBe(components);
  });

  it('keeps the offering values when the plan carries no resolved fields', () => {
    const plan = { components: [{ type: 'cores', price: '1' }] } as any;
    expect(resolvePlanComponents(components, plan)[0].billing_type).toBe(
      'limit',
    );
  });

  it('overrides billing fields from the plan components', () => {
    const plan = {
      components: [
        {
          type: 'cores',
          billing_type: 'usage',
          measured_unit: 'core-hours',
          is_prepaid: false,
          limit_period: 'month',
        },
        { type: 'ram', billing_type: 'usage', measured_unit: 'GB-hours' },
      ],
    } as any;
    const [cores, ram, consultancy] = resolvePlanComponents(components, plan);
    expect(cores.billing_type).toBe('usage');
    expect(cores.measured_unit).toBe('core-hours');
    expect(ram.measured_unit).toBe('GB-hours');
    // Not in the plan: untouched.
    expect(consultancy.billing_type).toBe('usage');
    expect(consultancy.measured_unit).toBe('hours');
  });
});

describe('getEffectiveComponents', () => {
  it('applies the offering type filter before resolving', () => {
    const offering = {
      type: 'Basic',
      components: [component('cpu', 'limit')],
    } as unknown as PublicOfferingDetails;
    const plan = {
      components: [{ type: 'cpu', billing_type: 'usage' }],
    } as any;
    expect(getEffectiveComponents(offering, plan)[0].billing_type).toBe(
      'usage',
    );
  });
});

describe('findResourcePlan', () => {
  it('finds the plan by uuid and tolerates missing data', () => {
    const plans = [{ uuid: 'a' }, { uuid: 'b' }];
    expect(findResourcePlan(plans, 'b')).toEqual({ uuid: 'b' });
    expect(findResourcePlan(plans, undefined)).toBeUndefined();
    expect(findResourcePlan(undefined, 'a')).toBeUndefined();
  });
});
