import { describe, expect, it } from 'vitest';
import { BillingTypeEnum, OfferingComponent } from 'waldur-js-client';

import { formatComponentCharge, isChargedOnPlanAmount } from './billingTypes';

// test/mocks/config.js pins CURRENCY_NAME to EUR and test/mocks/i18n.js pins
// the locale, so the formatted totals below are deterministic.
const component = (
  billing_type: BillingTypeEnum | string,
  is_prepaid = false,
) =>
  ({ billing_type, is_prepaid }) as Pick<
    OfferingComponent,
    'billing_type' | 'is_prepaid'
  >;

describe('isChargedOnPlanAmount', () => {
  it.each<[BillingTypeEnum, boolean]>([
    ['fixed', true],
    ['one', true],
    ['few', true],
    ['usage', false],
    ['limit', false],
  ])('%s -> %s', (type, expected) => {
    expect(isChargedOnPlanAmount(component(type))).toBe(expected);
  });

  it('is never true for a prepaid component', () => {
    // A prepaid quantity is the requested limit times the subscription length,
    // so a plan amount is saved nowhere and ignored everywhere.
    expect(isChargedOnPlanAmount(component('fixed', true))).toBe(false);
  });
});

describe('formatComponentCharge', () => {
  it('states the equation and the period for a fixed component', () => {
    expect(formatComponentCharge(component('fixed'), 4, 50, 'month')).toBe(
      '4 × 50 = €200.00 per month',
    );
  });

  it('falls back to a generic period when the plan has no unit', () => {
    expect(formatComponentCharge(component('fixed'), 4, 50)).toBe(
      '4 × 50 = €200.00 per billing period',
    );
  });

  it('says when a one-time component is charged', () => {
    expect(formatComponentCharge(component('one'), 2, 10, 'month')).toBe(
      '2 × 10 = €20.00 once at activation',
    );
  });

  it('says a plan-switch component is charged again on every switch', () => {
    expect(formatComponentCharge(component('few'), 1, 30, 'month')).toBe(
      '1 × 30 = €30.00 at activation and on every plan switch',
    );
  });

  it('keeps the multiplicand exact so it matches the price column', () => {
    // defaultCurrency only widens past 2 decimals below 0.05, so formatting the
    // price here would print €0.12 beside an input holding 0.12345.
    expect(formatComponentCharge(component('fixed'), 4, 0.12345, 'month')).toBe(
      '4 × 0.12345 = €0.49 per month',
    );
  });

  it('renders a zero amount rather than dropping the row', () => {
    expect(formatComponentCharge(component('fixed'), 0, 50, 'month')).toBe(
      '0 × 50 = €0.00 per month',
    );
  });

  it.each([
    ['prepaid', component('fixed', true), 4, 50],
    ['usage-based', component('usage'), 4, 50],
    ['limit-based', component('limit'), 4, 50],
    ['unknown billing type', component('nonsense'), 4, 50],
  ] as const)('returns null for a %s component', (_label, c, amount, price) => {
    expect(formatComponentCharge(c, amount, price, 'month')).toBeNull();
  });

  it.each([
    ['a missing amount', null, 50],
    ['a missing price', 4, null],
    ['a NaN price', 4, NaN],
  ] as const)('returns null for %s', (_label, amount, price) => {
    expect(
      formatComponentCharge(component('fixed'), amount, price, 'month'),
    ).toBeNull();
  });
});
