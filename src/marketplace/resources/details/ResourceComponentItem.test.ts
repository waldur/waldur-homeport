import { describe, expect, it } from 'vitest';
import { OfferingComponent } from 'waldur-js-client';

import { getQuotaCellProps } from './ResourceComponentItem';

const makeComponent = (
  overrides: Partial<OfferingComponent> = {},
): OfferingComponent =>
  ({
    type: 'node',
    name: 'node-hours',
    measured_unit: 'node-Hours',
    billing_type: 'limit',
    factor: null,
    ...overrides,
  }) as OfferingComponent;

const makeResource = (overrides = {}) => ({
  limits: { node: 1 },
  current_usages: { node: 0.33 },
  limit_usage: { node: 0.33 },
  ...overrides,
});

describe('getQuotaCellProps', () => {
  it('should preserve fractional usage for limit-based components', () => {
    const props = getQuotaCellProps(makeComponent(), makeResource());
    expect(props.usage).toBe('0.33');
    expect(props.limit).toBe('1');
    expect(props.title).toBe('node-hours node-Hours');
  });

  it('should return integer string when usage is a whole number', () => {
    const props = getQuotaCellProps(
      makeComponent(),
      makeResource({ limit_usage: { node: 1 }, current_usages: { node: 1 } }),
    );
    expect(props.usage).toBe('1');
    expect(props.limit).toBe('1');
  });

  it('should use limit_usage for limit billing type', () => {
    const props = getQuotaCellProps(
      makeComponent({ billing_type: 'limit' }),
      makeResource({
        limit_usage: { node: 0.75 },
        current_usages: { node: 0.5 },
      }),
    );
    expect(props.usage).toBe('0.75');
  });

  it('should use current_usages for usage billing type', () => {
    const props = getQuotaCellProps(
      makeComponent({ billing_type: 'usage' }),
      makeResource({
        limit_usage: { node: 0.75 },
        current_usages: { node: 0.5 },
        limits: { node: 100 },
      }),
    );
    expect(props.usage).toBe('0.50');
    expect(props.limit).toBe('100');
  });

  it('should apply factor when dividing values', () => {
    const props = getQuotaCellProps(
      makeComponent({ factor: 60 }),
      makeResource({ limit_usage: { node: 120 }, limits: { node: 3600 } }),
    );
    expect(props.usage).toBe('2');
    expect(props.limit).toBe('60');
  });

  it('should handle zero usage', () => {
    const props = getQuotaCellProps(
      makeComponent(),
      makeResource({ limit_usage: { node: 0 }, current_usages: { node: 0 } }),
    );
    expect(props.usage).toBe('0');
  });

  it('should handle null component', () => {
    const props = getQuotaCellProps(null, makeResource());
    expect(props.usage).toBe('');
    expect(props.limit).toBe('');
  });

  it('should return null limit for fixed billing type', () => {
    const props = getQuotaCellProps(
      makeComponent({ billing_type: 'fixed' }),
      makeResource({ limit_usage: null }),
    );
    expect(props.limit).toBeNull();
  });

  it('should fall back to current_usages when limit_usage is missing', () => {
    const props = getQuotaCellProps(
      makeComponent({ billing_type: 'limit' }),
      makeResource({ limit_usage: null, current_usages: { node: 0.45 } }),
    );
    expect(props.usage).toBe('0.45');
  });
});
