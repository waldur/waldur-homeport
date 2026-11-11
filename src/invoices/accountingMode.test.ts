import { afterEach, describe, expect, it } from 'vitest';

import { ENV } from '@/core/config';

import { getAccountingMode, isAccountingMode } from './accountingMode';

describe('accountingMode', () => {
  const originalFeatures = ENV.FEATURES;

  afterEach(() => {
    ENV.FEATURES = originalFeatures;
  });

  it('defaults to accounting when features are not loaded', () => {
    ENV.FEATURES = undefined;
    expect(getAccountingMode()).toBe('accounting');
    expect(isAccountingMode()).toBe(true);
  });

  it('defaults to accounting when the billing mode flag is absent', () => {
    ENV.FEATURES = { customer: {} };
    expect(getAccountingMode()).toBe('accounting');
  });

  it('stays in accounting mode when the billing mode flag is off', () => {
    ENV.FEATURES = { customer: { billing_mode: false } };
    expect(getAccountingMode()).toBe('accounting');
    expect(isAccountingMode()).toBe(true);
  });

  it('switches to billing mode when the billing mode flag is on', () => {
    ENV.FEATURES = { customer: { billing_mode: true } };
    expect(getAccountingMode()).toBe('billing');
    expect(isAccountingMode()).toBe(false);
  });
});
