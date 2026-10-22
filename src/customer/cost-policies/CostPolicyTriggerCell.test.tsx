import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { CostPolicyTriggerCell } from './CostPolicyTriggerCell';

describe('CostPolicyTriggerCell', () => {
  it('shows "No" with the reason a held policy waits', () => {
    renderWithProviders(
      <CostPolicyTriggerCell
        row={{
          has_fired: false,
          current_cost: '7701.67',
          limit_cost: 100,
          trigger_status: {
            gate: 'held_by_project_credit',
            triggered: false,
            credit_value_compared: '2850.00',
          },
        }}
      />,
    );
    expect(screen.getByText('No')).toBeInTheDocument();
    expect(screen.getByTestId('cost-policy-trigger-status')).toHaveTextContent(
      'Waiting for project credit',
    );
    expect(screen.getByTestId('cost-policy-trigger-detail')).toHaveTextContent(
      /2,850\.00 left, limit .*100\.00/,
    );
  });

  it('replaces "No" when the limit is reached and actions are pending', () => {
    renderWithProviders(
      <CostPolicyTriggerCell
        row={{
          has_fired: false,
          current_cost: '7701.67',
          limit_cost: 100,
          trigger_status: {
            gate: 'credit_exhausted',
            triggered: true,
            credit_value_compared: '0.00',
          },
        }}
      />,
    );
    expect(screen.queryByText('No')).not.toBeInTheDocument();
    expect(screen.getByTestId('cost-policy-trigger-status')).toHaveTextContent(
      'Limit reached, actions pending',
    );
  });

  it('shows only "Action triggered" against an older backend', () => {
    renderWithProviders(
      <CostPolicyTriggerCell row={{ has_fired: true, limit_cost: 100 }} />,
    );
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(
      screen.queryByTestId('cost-policy-trigger-status'),
    ).not.toBeInTheDocument();
  });
});
