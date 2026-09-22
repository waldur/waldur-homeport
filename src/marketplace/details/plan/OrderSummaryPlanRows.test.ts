import { describe, expect, it } from 'vitest';

import { getRowLabel } from './OrderSummaryPlanRows';
import { Component } from './types';

const component = (overrides: Partial<Component>): Component =>
  ({
    name: 'Compute',
    amount: 1,
    measured_unit: 'hours',
    ...overrides,
  }) as Component;

describe('getRowLabel', () => {
  it('states the unit the amount is counted in', () => {
    expect(getRowLabel(component({ amount: 80000 }))).toBe(
      'Compute 80,000 hours',
    );
  });

  // The row used to end in a stray space for a component that counts things
  // rather than measuring them.
  it('leaves no trailing separator when there is no unit', () => {
    expect(getRowLabel(component({ amount: 3, measured_unit: '' }))).toBe(
      'Compute 3',
    );
  });

  it('reads a boolean component as enabled or disabled', () => {
    const support = component({
      name: 'Premium support',
      amount: 1,
      is_boolean: true,
    });
    expect(getRowLabel(support)).toBe('Premium support Enabled');
    expect(getRowLabel({ ...support, amount: 0 })).toBe(
      'Premium support Disabled',
    );
  });

  // Prepaid rows price a quantity over a duration, and the summary states both.
  it('keeps the duration of a prepaid row', () => {
    expect(
      getRowLabel(
        component({ amount: 24000, displayAmount: 2000, durationInMonths: 12 }),
      ),
    ).toBe('Compute 2,000 hours × 12 months');
  });

  it('states the plain amount when no duration applies', () => {
    expect(getRowLabel(component({ amount: 2000, displayAmount: 2000 }))).toBe(
      'Compute 2,000 hours',
    );
  });
});
