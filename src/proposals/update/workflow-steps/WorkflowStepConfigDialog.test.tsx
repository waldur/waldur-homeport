import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalProtectedCallsWorkflowStepsPartialUpdate } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { WorkflowStepConfigDialog } from './WorkflowStepConfigDialog';

const renderDialog = (props: any) => {
  renderWithProviders(<WorkflowStepConfigDialog {...props} />);
};

describe('WorkflowStepConfigDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseCall = { uuid: 'call-uuid' };
  const baseStep = {
    uuid: 'step-uuid',
    step: 'administrative_check',
  };

  it('renders generic fields correctly for basic steps', async () => {
    renderDialog({
      resolve: {
        call: baseCall,
        step: baseStep,
        refetch: vi.fn(),
      },
    });

    expect(
      await screen.findByText(/Configure step: Administrative check/i),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Estimated duration \(days\)/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Responsible role/i)).toBeInTheDocument();
    expect(screen.getByText(/Transition mode options/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Applicant visible/i)).toBeInTheDocument();

    // Ensure extras are not rendered
    expect(
      screen.queryByLabelText(/Minimum reviewers/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(/Include award response/i),
    ).not.toBeInTheDocument();
  });

  it('renders review extra fields for expert_review step', async () => {
    renderDialog({
      resolve: {
        call: baseCall,
        step: { ...baseStep, step: 'expert_review' },
        refetch: vi.fn(),
      },
    });

    expect(
      await screen.findByText(/Configure criteria for Expert review/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Minimum reviewers/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Minimum score threshold/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Blind review/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Conflict of interest confirmation/i),
    ).toBeInTheDocument();
  });

  it('renders allocation extra fields for allocation_decision step', async () => {
    renderDialog({
      resolve: {
        call: baseCall,
        step: { ...baseStep, step: 'allocation_decision' },
        refetch: vi.fn(),
      },
    });

    expect(
      await screen.findByText(/Configure step: Allocation decision/i),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Include award response/i),
    ).toBeInTheDocument();
  });

  it('submits generic form data correctly', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(
      proposalProtectedCallsWorkflowStepsPartialUpdate,
    ).mockResolvedValue({} as any);

    renderDialog({
      resolve: {
        call: baseCall,
        step: {
          ...baseStep,
          duration_in_days: 10,
          responsible_role: 'call_manager',
          transition_mode: 'automatic_on_completion',
          applicant_visible: false,
        },
        refetch,
      },
    });

    expect(
      await screen.findByText(/Configure step: Administrative check/i),
    ).toBeInTheDocument();

    await user.clear(screen.getByLabelText(/Estimated duration \(days\)/i));
    await user.type(
      screen.getByLabelText(/Estimated duration \(days\)/i),
      '20',
    );

    await user.click(screen.getByLabelText(/Applicant visible/i));

    const submitBtn = screen.getByRole('button', { name: /Save/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(
        proposalProtectedCallsWorkflowStepsPartialUpdate,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'call-uuid', obj_uuid: 'step-uuid' },
          body: expect.objectContaining({
            duration_in_days: '20',
            applicant_visible: true,
            responsible_role: 'call_manager',
            transition_mode: 'automatic_on_completion',
          }),
        }),
      );
      expect(refetch).toHaveBeenCalled();
    });
  });

  it('submits review extra fields correctly', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(
      proposalProtectedCallsWorkflowStepsPartialUpdate,
    ).mockResolvedValue({} as any);

    renderDialog({
      resolve: {
        call: baseCall,
        step: {
          ...baseStep,
          step: 'expert_review',
          duration_in_days: 10,
          responsible_role: 'reviewer',
          transition_mode: 'manual',
          applicant_visible: false,
          min_reviewers: 1,
          min_score_threshold: '5.0',
          blind_review: false,
          requires_coi_confirmation: false,
        },
        refetch,
      },
    });

    expect(
      await screen.findByText(/Configure criteria for Expert review/i),
    ).toBeInTheDocument();

    await user.click(screen.getByLabelText(/Blind review/i));

    const submitBtn = screen.getByRole('button', { name: /Save/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(
        proposalProtectedCallsWorkflowStepsPartialUpdate,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'call-uuid', obj_uuid: 'step-uuid' },
          body: expect.objectContaining({
            blind_review: true,
            min_reviewers: 1,
            min_score_threshold: '5.0',
          }),
        }),
      );
    });
  });
});
