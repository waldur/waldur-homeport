import { describe, expect, it } from 'vitest';

import { getUnpreviewableDiscounts } from './discountPreview';

const TIERED = '15 if usage >= 200000 else 8 if usage >= 100000 else 0';

const planComponent = (overrides = {}) => ({
  type: 'cpu_hours',
  name: 'CPU Core Hours',
  discount_formula: TIERED,
  discount_aggregation: 'resource',
  ...overrides,
});

const offeringComponents = [{ type: 'cpu_hours', billing_type: 'limit' }];

describe('unpreviewable discounts', () => {
  // The one combination combinePrices can evaluate up front.
  it('says nothing about a per-resource tiered discount on a limit', () => {
    expect(
      getUnpreviewableDiscounts([planComponent()], offeringComponents),
    ).toEqual([]);
  });

  it('flags a customer-scoped discount', () => {
    expect(
      getUnpreviewableDiscounts(
        [planComponent({ discount_aggregation: 'customer' })],
        offeringComponents,
      ),
    ).toEqual(['CPU Core Hours']);
  });

  // MIN(20, usage/100) and friends are applied at invoicing only.
  it('flags a formula that is not tier-shaped', () => {
    expect(
      getUnpreviewableDiscounts(
        [planComponent({ discount_formula: 'MIN(20, usage/100)' })],
        offeringComponents,
      ),
    ).toEqual(['CPU Core Hours']);
  });

  // Usage is metered afterwards, so there is no requested quantity to tier on.
  it('flags a discount on a usage component', () => {
    expect(
      getUnpreviewableDiscounts(
        [planComponent()],
        [{ type: 'cpu_hours', billing_type: 'usage' }],
      ),
    ).toEqual(['CPU Core Hours']);
  });

  it('ignores components carrying no discount at all', () => {
    expect(
      getUnpreviewableDiscounts(
        [planComponent({ discount_formula: '  ' })],
        offeringComponents,
      ),
    ).toEqual([]);
  });

  it('copes with missing data', () => {
    expect(getUnpreviewableDiscounts(undefined, undefined)).toEqual([]);
  });
});
