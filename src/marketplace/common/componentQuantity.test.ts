import { describe, expect, it } from 'vitest';

import {
  findQuantityComponent,
  formatComponentQuantity,
  formatQuantityLabel,
  getComponentLabel,
} from './componentQuantity';

const COMPONENTS = [
  { type: 'cpu_hours', name: 'Compute', measured_unit: 'RSU' },
  { type: 'storage', name: 'Project Storage', measured_unit: 'TiB' },
  { type: 'nodes', name: 'Nodes', measured_unit: '' },
  { type: 'support', name: 'Premium support', is_boolean: true },
  {
    type: 'fine',
    name: 'Fine grained',
    measured_unit: 'CPU',
    limit_decimal_places: 4,
  },
];

describe('formatComponentQuantity', () => {
  // The bug this exists for: a read-only proposal printed "1000x", which reads
  // as a multiplier rather than as 1,000 RSU.
  it('states the unit the amount is counted in', () => {
    expect(formatComponentQuantity(1000, COMPONENTS[0])).toBe('1,000 RSU');
    expect(formatComponentQuantity(3, COMPONENTS[1])).toBe('3 TiB');
  });

  it('separates thousands', () => {
    expect(formatComponentQuantity(1000000, COMPONENTS[0])).toBe(
      '1,000,000 RSU',
    );
  });

  it('keeps the decimals a fractional limit was requested with', () => {
    expect(formatComponentQuantity(0.5, COMPONENTS[1])).toBe('0.5 TiB');
    expect(formatComponentQuantity('1.25', COMPONENTS[1])).toBe('1.25 TiB');
  });

  it('adds no suffix to a component that is a plain count', () => {
    expect(formatComponentQuantity(3, COMPONENTS[2])).toBe('3');
    expect(formatComponentQuantity(3)).toBe('3');
  });

  // The order's limits table already had wording for this; matching it keeps
  // one boolean limit from reading two ways in one flow.
  it('reads a boolean component as enabled or disabled', () => {
    expect(formatComponentQuantity(1, COMPONENTS[3])).toBe('Enabled');
    expect(formatComponentQuantity(0, COMPONENTS[3])).toBe('Disabled');
  });

  it('keeps 0 as an amount, not as "not set"', () => {
    expect(formatComponentQuantity(0, COMPONENTS[0])).toBe('0 RSU');
  });

  // Intl stops at three places on its own, which is below what a component is
  // allowed to declare.
  it('keeps every place the component accepts', () => {
    expect(formatComponentQuantity(1.2345, COMPONENTS[4])).toBe('1.2345 CPU');
  });

  it('still rounds at three places for a component that declares none', () => {
    expect(formatComponentQuantity(1.23456, COMPONENTS[1])).toBe('1.235 TiB');
  });

  it.each([[null], [undefined], ['']])('renders %p as empty', (amount) => {
    expect(formatComponentQuantity(amount, COMPONENTS[0])).toBe('');
  });
});

describe('getComponentLabel', () => {
  it('names a component as the offering does', () => {
    expect(getComponentLabel('cpu_hours', COMPONENTS)).toBe('Compute');
  });

  // Surfaces that carry no components still have to render the key.
  it('falls back to the component type', () => {
    expect(getComponentLabel('cpu_hours', [])).toBe('Cpu hours');
    expect(getComponentLabel('cpu_hours')).toBe('Cpu hours');
    expect(getComponentLabel('gpu_hours', COMPONENTS)).toBe('Gpu hours');
  });
});

describe('findQuantityComponent', () => {
  it('matches on type', () => {
    expect(findQuantityComponent(COMPONENTS, 'storage')?.name).toBe(
      'Project Storage',
    );
  });

  it.each([[undefined], [null]])('tolerates %p components', (components) => {
    expect(findQuantityComponent(components, 'storage')).toBeUndefined();
  });
});

describe('formatQuantityLabel', () => {
  it('labels an amount', () => {
    expect(formatQuantityLabel(80000, COMPONENTS[0])).toBe(
      'Quantity: 80,000 RSU',
    );
  });

  // "Quantity: Enabled" is not a sentence.
  it('drops the label for a boolean component', () => {
    expect(formatQuantityLabel(1, COMPONENTS[3])).toBe('Enabled');
  });
});
