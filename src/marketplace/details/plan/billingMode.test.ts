import { describe, expect, it } from 'vitest';
import { PublicOfferingDetails } from 'waldur-js-client';

import {
  getPlanBillingMode,
  getPlanBillingModeLabel,
  getResourceBillingMode,
  offeringHasBuiltinComponents,
  toPlanBilling,
} from './billingMode';

const offering = {
  type: 'OpenStack.Tenant',
  components: [
    { type: 'cores', name: 'Cores', billing_type: 'limit', is_builtin: true },
    { type: 'ram', name: 'RAM', billing_type: 'limit', is_builtin: true },
    {
      type: 'consultancy',
      name: 'Consultancy',
      billing_type: 'usage',
      is_builtin: false,
    },
  ],
} as unknown as PublicOfferingDetails;

describe('getPlanBillingMode', () => {
  it('returns the explicit mode of the plan', () => {
    expect(
      getPlanBillingMode(offering, { billing_mode: 'usage', components: [] }),
    ).toBe('usage');
    expect(
      getPlanBillingMode(offering, { billing_mode: 'limit', components: [] }),
    ).toBe('limit');
  });

  it('infers the mode from the effective builtin components when inheriting', () => {
    expect(
      getPlanBillingMode(offering, {
        billing_mode: 'inherit',
        components: [],
      }),
    ).toBe('limit');
    expect(
      getPlanBillingMode(offering, {
        billing_mode: 'inherit',
        components: [
          { type: 'cores', billing_type: 'usage' },
          { type: 'ram', billing_type: 'usage' },
        ],
      } as any),
    ).toBe('usage');
  });

  it('reports mixed when the builtins differ', () => {
    expect(
      getPlanBillingMode(offering, {
        components: [{ type: 'cores', billing_type: 'usage' }],
      } as any),
    ).toBe('mixed');
  });

  it('classifies every component when the offering has no builtins', () => {
    const custom = {
      type: 'Basic',
      components: [
        {
          type: 'cpu',
          billing_type: 'one',
          is_prepaid: true,
          is_builtin: false,
        },
      ],
    } as unknown as PublicOfferingDetails;
    expect(getPlanBillingMode(custom, { components: [] })).toBe('prepaid');
  });

  it('returns null without a plan', () => {
    expect(getPlanBillingMode(offering, null)).toBeNull();
  });

  it('classifies a plan with only fixed-price components as fixed', () => {
    const fixed = {
      type: 'Basic',
      components: [
        { type: 'fee', billing_type: 'fixed', is_builtin: false },
        {
          type: 'setup',
          billing_type: 'one',
          is_prepaid: false,
          is_builtin: false,
        },
      ],
    } as unknown as PublicOfferingDetails;
    expect(getPlanBillingMode(fixed, { components: [] })).toBe('fixed');
  });
});

describe('helpers', () => {
  it('labels every mode', () => {
    expect(getPlanBillingModeLabel('limit')).toBe('Limit-based (monthly)');
    expect(getPlanBillingModeLabel('usage')).toBe('Usage-based');
    expect(getPlanBillingModeLabel('fixed')).toBe('Fixed price');
    expect(getPlanBillingModeLabel(null)).toBe('');
  });

  it('narrows the billing word the backend sends', () => {
    expect(toPlanBilling('fixed')).toBe('fixed');
    expect(toPlanBilling('usage')).toBe('usage');
    expect(toPlanBilling('inherit')).toBeNull();
    expect(toPlanBilling('something-new')).toBeNull();
    expect(toPlanBilling(null)).toBeNull();
    expect(toPlanBilling(undefined)).toBeNull();
  });

  it('detects builtin components', () => {
    expect(offeringHasBuiltinComponents(offering)).toBe(true);
    expect(
      offeringHasBuiltinComponents({ components: [{ is_builtin: false }] }),
    ).toBe(false);
    expect(offeringHasBuiltinComponents(undefined)).toBe(false);
  });

  it('derives the resource mode from the resolved flags', () => {
    expect(getResourceBillingMode({ is_usage_based: true })).toBe('usage');
    expect(getResourceBillingMode({ is_limit_based: true })).toBe('limit');
    expect(
      getResourceBillingMode({ is_usage_based: true, is_limit_based: true }),
    ).toBe('mixed');
    expect(getResourceBillingMode({})).toBeNull();
  });
});
