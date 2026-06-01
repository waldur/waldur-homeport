import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalProtectedCallsWorkflowStepsSet } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { AddWorkflowStepDialog } from './AddWorkflowStepDialog';

const renderDialog = (props: any) => {
  renderWithProviders(<AddWorkflowStepDialog {...props} />);
};

describe('AddWorkflowStepDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseCall = { uuid: 'call-uuid' };

  it('renders base form fields and disables submit if step is not selected', async () => {
    renderDialog({
      resolve: {
        call: baseCall,
        configuredSteps: [],
        refetch: vi.fn(),
      },
    });

    expect(await screen.findByText(/Add step/i)).toBeInTheDocument();

    // Step is not selected yet
    expect(screen.getByRole('button', { name: /Save/i })).toBeDisabled();

    expect(screen.getByLabelText(/Step/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Estimated duration \(days\)/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Responsible role/i)).toBeInTheDocument();
    expect(screen.getByText(/Transition mode options/i)).toBeInTheDocument();
  });

  it('shows allocation decision extra fields', async () => {
    const user = userEvent.setup();
    renderDialog({
      resolve: {
        call: baseCall,
        configuredSteps: [],
        refetch: vi.fn(),
      },
    });

    expect(await screen.findByText(/Add step/i)).toBeInTheDocument();

    await user.click(screen.getByLabelText(/Step/i));
    await user.click(await screen.findByText('Allocation decision'));

    expect(
      await screen.findByText(/Include Award response/i),
    ).toBeInTheDocument();
  });

  it('submits form correctly for expert review step', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(proposalProtectedCallsWorkflowStepsSet).mockResolvedValue(
      {} as any,
    );

    renderDialog({
      resolve: {
        call: baseCall,
        configuredSteps: [],
        refetch,
      },
    });

    expect(await screen.findByText(/Add step/i)).toBeInTheDocument();

    await user.click(screen.getByLabelText(/Step/i));
    await user.click(await screen.findByText('Expert review'));

    // Expert review extras
    expect(
      await screen.findByLabelText(/Minimal amount of reviews/i),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText(/Estimated duration \(days\)/i), '5');

    await user.click(screen.getByLabelText(/Responsible role/i));
    await user.click(await screen.findByText('Reviewer'));

    await user.click(screen.getByLabelText(/Automatic/i));

    const minReviewersInput = screen.getByLabelText(
      /Minimal amount of reviews/i,
    );
    await user.type(minReviewersInput, '2');

    // Click submit
    const submitBtn = screen.getByRole('button', { name: /Save/i });
    expect(submitBtn).not.toBeDisabled();
    await user.click(submitBtn);

    await waitFor(() => {
      expect(proposalProtectedCallsWorkflowStepsSet).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'call-uuid' },
          body: expect.objectContaining({
            step: 'expert_review',
            duration_in_days: '5',
            min_reviewers: '2',
            responsible_role: 'reviewer',
          }),
        }),
      );
      expect(refetch).toHaveBeenCalled();
    });
  });
});
