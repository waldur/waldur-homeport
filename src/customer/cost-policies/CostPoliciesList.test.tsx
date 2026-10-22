import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CostPoliciesListTable } from './CostPoliciesList';

vi.mock('@/table/useTable', () => ({
  useTable: () => ({ fetch: vi.fn(), rows: [] }),
}));

let tableProps;
vi.mock('@/table/Table', () => ({
  default: (props) => {
    tableProps = props;
    return null;
  },
}));

const column = (title: string) =>
  tableProps.columns
    .filter(Boolean)
    // A title with a help icon also carries the icon's accessible text.
    .find((c) =>
      render(<>{c.title}</>).container.textContent.startsWith(title),
    );

const row = {
  uuid: 'policy',
  scope_name: 'Climate Simulation',
  scope_uuid: 'project',
  actions: 'notify_project_team',
  limit_cost: 100,
  period: 1,
  has_fired: false,
  current_cost: '7701.67',
  billing_price_estimate: { current: '12.00' },
  project_credit: '2900.00',
  trigger_status: {
    gate: 'held_by_project_credit',
    triggered: false,
    credit_value_compared: '2900.00',
  },
};

describe('CostPoliciesListTable', () => {
  it('shows the cost the policy compares, not the billing estimate', () => {
    render(<CostPoliciesListTable table="test" />);
    render(<>{column('Current cost').render({ row })}</>);
    expect(screen.getByText(/7,701\.67/)).toBeInTheDocument();
    expect(screen.queryByText(/12\.00/)).not.toBeInTheDocument();
  });

  it('renders a withheld organization credit as a dash', () => {
    render(<CostPoliciesListTable table="test" />);
    const { container } = render(
      <>{column('Organization credit').render({ row })}</>,
    );
    expect(container.textContent).toBe('—');
  });

  it('shows why the policy waits next to "Action triggered"', () => {
    render(<CostPoliciesListTable table="test" />);
    render(<>{column('Action triggered').render({ row })}</>);
    expect(screen.getByTestId('cost-policy-trigger-status')).toHaveTextContent(
      'Waiting for project credit',
    );
  });
});
