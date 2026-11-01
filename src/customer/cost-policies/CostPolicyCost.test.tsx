import { screen } from '@testing-library/react';
import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { CostPolicyCost } from './CostPolicyCost';
import { getCostPolicyFigures } from './costPolicyDetails';

const today = DateTime.fromISO('2026-10-15');

// No credit paid September, so the uncovered months add up to exactly the
// earlier part of the cost.
const months = [
  {
    period: '2026-09-01',
    cost: '1000.00',
    covered: '0.00',
    uncovered: '1000.00',
    in_period: true,
  },
];

const renderCost = (use_credit?: boolean) => {
  const policy = {
    use_credit,
    period: 1,
    current_cost: '1100.00',
    limit_cost: 300,
    cost_breakdown: {
      cost_before_credit: '1100.00',
      credit_drawn: '0.00',
      credit_pending: '0.00',
      earlier_months: '1000.00',
    },
  };
  renderWithProviders(
    <CostPolicyCost
      policy={policy}
      figures={getCostPolicyFigures(policy)}
      months={months}
      today={today}
    />,
  );
};

describe('CostPolicyCost', () => {
  it('goes month by month when the months explain the cost', () => {
    renderCost(true);
    expect(screen.getByTestId('cost-policy-month-strip')).toBeInTheDocument();
    expect(screen.queryByTestId('cost-policy-cost-bar')).toBeNull();
  });

  it('shows the full cost of a policy that ignores credit, not what credit left', () => {
    renderCost(false);
    expect(screen.queryByTestId('cost-policy-month-strip')).toBeNull();
    const bar = screen.getByTestId('cost-policy-cost-bar');
    expect(bar).toHaveTextContent('Earlier months');
    expect(bar).toHaveTextContent('This month');
    expect(bar).not.toHaveTextContent('not covered');
    expect(
      screen.getByText(
        'The policy counts the full cost, whatever credit paid: €1,100.00, over the €300.00 limit.',
      ),
    ).toBeInTheDocument();
  });
});
