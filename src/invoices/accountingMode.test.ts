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

  it('defaults to accounting when the flag is absent', () => {
    ENV.FEATURES = { customer: {} };
    expect(getAccountingMode()).toBe('accounting');
  });

  it('stays in accounting mode when the flag is off', () => {
    ENV.FEATURES = { customer: { show_invoices_with_vat: false } };
    expect(getAccountingMode()).toBe('accounting');
    expect(isAccountingMode()).toBe(true);
  });

  it('switches to billing mode when the flag is on', () => {
    ENV.FEATURES = { customer: { show_invoices_with_vat: true } };
    expect(getAccountingMode()).toBe('billing');
    expect(isAccountingMode()).toBe(false);
  });
});
