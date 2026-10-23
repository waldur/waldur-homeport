import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { CostPolicyTriggerCell } from './CostPolicyTriggerCell';

describe('CostPolicyTriggerCell', () => {
  it('shows a held policy as one badge, with the figures left to its tooltip', () => {
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
    expect(screen.queryByText('No')).not.toBeInTheDocument();
    expect(screen.getByTestId('cost-policy-trigger-status')).toHaveTextContent(
      'Waiting for project credit',
    );
    expect(screen.queryByText(/2,850\.00/)).not.toBeInTheDocument();
  });

  it('says the actions are pending when the limit is reached', () => {
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
      'Actions pending',
    );
  });

  it('shows a fired policy without a separate "Yes", next to what it affected', () => {
    renderWithProviders(
      <CostPolicyTriggerCell
        row={{
          has_fired: true,
          current_cost: '7701.67',
          limit_cost: 100,
          trigger_status: {
            gate: 'credit_exhausted',
            triggered: true,
            credit_value_compared: '0.00',
          },
        }}
      >
        <span>1 resource</span>
      </CostPolicyTriggerCell>,
    );
    expect(screen.queryByText('Yes')).not.toBeInTheDocument();
    expect(screen.getByTestId('cost-policy-trigger-status')).toHaveTextContent(
      'Limit reached',
    );
    expect(screen.getByText('1 resource')).toBeInTheDocument();
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
