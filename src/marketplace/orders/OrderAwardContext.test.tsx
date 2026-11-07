import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OrderAward } from 'waldur-js-client';

import { getAwardLimitLines, OrderAwardLimits } from './OrderAwardContext';

const award = (overrides: Partial<OrderAward> = {}): OrderAward => ({
  proposal_uuid: 'p',
  proposal_name: 'Proposal',
  call_uuid: 'c',
  call_name: 'Call',
  round_name: 'Round 1',
  awarded_limits: { gpu: 10, cpu: 500 },
  requested_limits: { cpu: 1000, gpu: 10 },
  can_read: true,
  ...overrides,
});

const components = [
  { type: 'cpu', name: 'CPU hours', measured_unit: 'hours' },
  { type: 'gpu', name: 'GPU hours', measured_unit: 'hours' },
];

describe('getAwardLimitLines', () => {
  it('names components in the offering order', () => {
    const lines = getAwardLimitLines(award(), components);
    expect(lines.map((l) => l.label)).toEqual(['CPU hours', 'GPU hours']);
    expect(lines[0]).toMatchObject({ awarded: 500, requested: 1000 });
  });

  it('falls back to the type when components are unknown', () => {
    const lines = getAwardLimitLines(award({ requested_limits: null }));
    expect(lines.map((l) => l.label)).toEqual(['gpu', 'cpu']);
    expect(lines.every((l) => l.requested === null)).toBe(true);
  });
});

describe('OrderAwardLimits', () => {
  it('shows awarded against requested', () => {
    render(<OrderAwardLimits award={award()} components={components} />);
    expect(
      screen.getByText(/500 hours awarded of 1,?000 hours requested/),
    ).toBeTruthy();
  });

  it('shows only the award for an item the call manager added', () => {
    render(
      <OrderAwardLimits
        award={award({ requested_limits: null })}
        components={components}
      />,
    );
    expect(screen.queryByText(/requested/)).toBeNull();
    expect(screen.getByText(/10 hours awarded/)).toBeTruthy();
  });
});
