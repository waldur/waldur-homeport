import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  proposalProposalsBudgetRetrieve,
  proposalProposalsCompleteWorkflowStep,
} from 'waldur-js-client';

import { DrawerProvider } from '@/drawer/DrawerContext';
import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { CompleteWorkflowStepDialog } from './CompleteWorkflowStepDialog';

const step = {
  uuid: 'step-1',
  step: 'allocation_decision',
  kind: 'decision',
  outcome_set: 'approval',
  is_allocation_decision: true,
  allowed_outcomes: ['approved', 'declined'],
  step_name: 'Allocation decision',
} as any;

const budget = (fits: boolean, enforcement = 'soft') => ({
  data: {
    budget_enforcement: enforcement,
    entries: [
      {
        pool_uuid: 'b1',
        offering_name: 'HPC',
        component_type: 'cpu',
        round_name: null,
        offered_total: 100,
        awarded_so_far: 60,
        remaining: 40,
        award: fits ? 30 : 50,
        fits,
      },
    ],
  },
});

const renderDialog = () =>
  renderWithProviders(
    <DrawerProvider>
      <Provider store={configureStore()({ tables: {} })}>
        <CompleteWorkflowStepDialog
          resolve={{ proposal: { uuid: 'proposal-1' } as any, step }}
        />
      </Provider>
    </DrawerProvider>,
  );

const approve = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('combobox'));
  await user.click(await screen.findByText('Approved'));
};

describe('CompleteWorkflowStepDialog budget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(proposalProposalsCompleteWorkflowStep).mockResolvedValue({
      data: { detail: 'Step completed.' },
    } as any);
  });

  it('shows where the award stands and offers no override when it fits', async () => {
    vi.mocked(proposalProposalsBudgetRetrieve).mockResolvedValue(
      budget(true) as any,
    );
    renderDialog();

    await screen.findByTestId('proposal-budget');
    expect(
      await screen.findByText('HPC / cpu (whole call)'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Override the budget')).not.toBeInTheDocument();
  });

  it('sends the override with its reason when the award does not fit', async () => {
    const user = userEvent.setup();
    vi.mocked(proposalProposalsBudgetRetrieve).mockResolvedValue(
      budget(false) as any,
    );
    renderDialog();

    await screen.findByText('Override the budget');
    await approve(user);
    await user.click(screen.getByLabelText('Override the budget'));
    await user.type(
      screen.getByLabelText(/Reason for overriding the budget/),
      'Strategic',
    );
    await user.click(screen.getByRole('button', { name: /Complete step/ }));

    await waitFor(() =>
      expect(proposalProposalsCompleteWorkflowStep).toHaveBeenCalledWith({
        path: { uuid: 'proposal-1' },
        body: expect.objectContaining({
          outcome: 'approved',
          override_budget: true,
          budget_override_reason: 'Strategic',
        }),
      }),
    );
  });

  it('does not send an override that was not asked for', async () => {
    const user = userEvent.setup();
    vi.mocked(proposalProposalsBudgetRetrieve).mockResolvedValue(
      budget(false, 'hard') as any,
    );
    renderDialog();

    expect(
      await screen.findByText(/only staff may override it/),
    ).toBeInTheDocument();
    await approve(user);
    await user.click(screen.getByRole('button', { name: /Complete step/ }));

    await waitFor(() =>
      expect(proposalProposalsCompleteWorkflowStep).toHaveBeenCalled(),
    );
    expect(
      vi.mocked(proposalProposalsCompleteWorkflowStep).mock.calls[0][0].body,
    ).not.toHaveProperty('override_budget');
  });

  it('shows nothing of the budget to someone refused it', async () => {
    vi.mocked(proposalProposalsBudgetRetrieve).mockRejectedValue({
      response: { status: 403 },
      status: 403,
    });
    renderDialog();

    await waitFor(() =>
      expect(proposalProposalsBudgetRetrieve).toHaveBeenCalled(),
    );
    expect(screen.queryByTestId('proposal-budget')).not.toBeInTheDocument();
    expect(screen.queryByText('Override the budget')).not.toBeInTheDocument();
  });
});

describe('CompleteWorkflowStepDialog on a strictly enforced budget', () => {
  beforeEach(() => {
    vi.mocked(proposalProposalsBudgetRetrieve).mockResolvedValue(
      budget(false, 'hard') as any,
    );
  });

  it('offers no override to a call manager, only says who may', async () => {
    vi.mocked(useUser).mockReturnValue({ uuid: 'manager' } as any);
    renderDialog();

    expect(
      await screen.findByText('The award exceeds the budget'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Override the budget')).not.toBeInTheDocument();
  });

  it('offers the override to staff', async () => {
    vi.mocked(useUser).mockReturnValue({
      uuid: 'staff',
      is_staff: true,
    } as any);
    renderDialog();

    expect(await screen.findByText('Override the budget')).toBeInTheDocument();
  });
});
