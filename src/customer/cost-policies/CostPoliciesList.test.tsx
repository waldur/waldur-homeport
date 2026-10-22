import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { customerCreditsList } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { useCustomer } from '@/workspace/hooks';

import { CostPoliciesList, CostPoliciesListTable } from './CostPoliciesList';

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

  it('does not repeat the organization credit on every row', () => {
    render(<CostPoliciesListTable table="test" />);
    expect(column('Organization credit')).toBeUndefined();
    expect(column('Project credit')).toBeDefined();
  });

  it('shows the organization credit once, as the subtitle', async () => {
    vi.mocked(useCustomer).mockReturnValue({ uuid: 'org' } as any);
    vi.mocked(customerCreditsList).mockResolvedValue({
      data: [{ value: '483155.00' }],
    } as any);
    renderWithProviders(<CostPoliciesList />);
    await waitFor(() =>
      expect(tableProps.subtitle).toMatch(
        /^Organization credit, .+ balance: .*483,155\.00$/,
      ),
    );
    expect(customerCreditsList).toHaveBeenCalledWith({
      query: { customer_uuid: 'org' },
    });
  });

  it('shows why the policy waits next to "Action triggered"', () => {
    render(<CostPoliciesListTable table="test" />);
    render(<>{column('Action triggered').render({ row })}</>);
    expect(screen.getByTestId('cost-policy-trigger-status')).toHaveTextContent(
      'Waiting for project credit',
    );
  });

  it.each([
    [1, '1 resource'],
    [3, '3 resources'],
  ])(
    'counts %i affected resource(s) after a fired policy',
    (count, expected) => {
      render(<CostPoliciesListTable table="test" />);
      render(
        <>
          {column('Action triggered').render({
            row: {
              ...row,
              has_fired: true,
              affected_resources_count: count,
              trigger_status: {
                gate: 'credit_exhausted',
                triggered: true,
                credit_value_compared: '0.00',
              },
            },
          })}
        </>,
      );
      expect(screen.getByText(expected)).toBeInTheDocument();
    },
  );
});
