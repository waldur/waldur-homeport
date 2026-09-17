import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalProtectedCallsWorkflowStepsPartialUpdate } from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';

import { WorkflowStepConfigDialog } from './WorkflowStepConfigDialog';

const renderDialog = (props: any) => {
  // `steps` is only consulted by the enable switch; tests that say nothing
  // about dependencies get an empty set.
  const resolve = { steps: [], ...props.resolve };
  renderWithProviders(
    <WorkflowStepConfigDialog {...props} resolve={resolve} />,
  );
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
  describe('enable switch', () => {
    const disabledStep = {
      ...baseStep,
      step: 'technical_assessment',
      is_enabled: false,
      responsible_role: 'offering_manager',
      transition_mode: 'automatic_on_completion',
    };

    it('turns a disabled step on from the dialog the user configures it in', async () => {
      const user = userEvent.setup();
      vi.mocked(
        proposalProtectedCallsWorkflowStepsPartialUpdate,
      ).mockResolvedValue({} as any);

      renderDialog({
        resolve: {
          call: baseCall,
          step: disabledStep,
          steps: [disabledStep],
          refetch: vi.fn(),
        },
      });

      const toggle = await screen.findByLabelText(/Step enabled/i);
      expect(toggle).not.toBeChecked();

      await user.click(toggle);
      await user.click(screen.getByRole('button', { name: /Save/i }));

      await waitFor(() =>
        expect(
          proposalProtectedCallsWorkflowStepsPartialUpdate,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            path: { uuid: 'call-uuid', obj_uuid: 'step-uuid' },
            body: expect.objectContaining({ is_enabled: true }),
          }),
        ),
      );
    });

    it('leaves is_enabled out of the payload when the switch is untouched', async () => {
      const user = userEvent.setup();
      vi.mocked(
        proposalProtectedCallsWorkflowStepsPartialUpdate,
      ).mockResolvedValue({} as any);

      renderDialog({
        resolve: {
          call: baseCall,
          step: disabledStep,
          steps: [disabledStep],
          refetch: vi.fn(),
        },
      });

      await user.type(
        await screen.findByLabelText(/Estimated duration \(days\)/i),
        '7',
      );
      await user.click(screen.getByRole('button', { name: /Save/i }));

      // Saving an unrelated field must not re-assert the enabled state, which
      // would clobber a concurrent disable by somebody else.
      await waitFor(() =>
        expect(
          proposalProtectedCallsWorkflowStepsPartialUpdate,
        ).toHaveBeenCalled(),
      );
      const body = vi.mocked(proposalProtectedCallsWorkflowStepsPartialUpdate)
        .mock.calls[0][0].body;
      expect(body).not.toHaveProperty('is_enabled');
    });

    it('refuses to enable a step whose dependency is disabled', async () => {
      const expert = {
        uuid: 'expert-uuid',
        step: 'expert_review',
        is_enabled: false,
      };
      const panel = {
        ...baseStep,
        step: 'panel_review',
        is_enabled: false,
        responsible_role: 'panel_member',
      };

      renderDialog({
        resolve: {
          call: baseCall,
          step: panel,
          steps: [expert, panel],
          refetch: vi.fn(),
        },
      });

      expect(await screen.findByLabelText(/Step enabled/i)).toBeDisabled();
      expect(
        screen.getByText(/Enable Expert review first\./i),
      ).toBeInTheDocument();
    });

    const expertWithPanel = () => {
      const expert = {
        ...baseStep,
        step: 'expert_review',
        is_enabled: true,
        responsible_role: 'reviewer',
      };
      const panel = {
        uuid: 'panel-uuid',
        step: 'panel_review',
        is_enabled: true,
      };
      return { expert, panel };
    };

    it('warns before a disable takes its dependents with it', async () => {
      const user = userEvent.setup();
      const confirmMock = vi.mocked(useModal().confirm);
      vi.mocked(
        proposalProtectedCallsWorkflowStepsPartialUpdate,
      ).mockResolvedValue({} as any);
      const { expert, panel } = expertWithPanel();

      renderDialog({
        resolve: {
          call: baseCall,
          step: expert,
          steps: [expert, panel],
          refetch: vi.fn(),
        },
      });

      // The switch says what will happen before the user commits to it.
      const toggle = await screen.findByLabelText(/Step enabled/i);
      expect(toggle).not.toBeDisabled();
      expect(
        screen.getByText(/also disables Panel review/i),
      ).toBeInTheDocument();

      await user.click(toggle);
      await user.click(screen.getByRole('button', { name: /Save/i }));

      await waitFor(() => expect(confirmMock).toHaveBeenCalledTimes(1));

      // The form fields first, so a rejected form changes nothing; then the
      // dependents, so none outlives its dependency even between two
      // requests; then the step itself.
      await waitFor(() =>
        expect(
          proposalProtectedCallsWorkflowStepsPartialUpdate,
        ).toHaveBeenCalledTimes(3),
      );
      const calls = vi.mocked(proposalProtectedCallsWorkflowStepsPartialUpdate)
        .mock.calls;
      expect(calls[0][0].path).toEqual({
        uuid: 'call-uuid',
        obj_uuid: 'step-uuid',
      });
      expect(calls[0][0].body).not.toHaveProperty('is_enabled');
      expect(calls[1][0]).toEqual({
        path: { uuid: 'call-uuid', obj_uuid: 'panel-uuid' },
        body: { is_enabled: false },
      });
      expect(calls[2][0]).toEqual({
        path: { uuid: 'call-uuid', obj_uuid: 'step-uuid' },
        body: { is_enabled: false },
      });
    });

    it('changes nothing when the cascade warning is cancelled', async () => {
      const user = userEvent.setup();
      const confirmMock = vi.mocked(useModal().confirm);
      confirmMock.mockRejectedValueOnce(new Error('cancelled'));
      const { expert, panel } = expertWithPanel();

      renderDialog({
        resolve: {
          call: baseCall,
          step: expert,
          steps: [expert, panel],
          refetch: vi.fn(),
        },
      });

      await user.click(await screen.findByLabelText(/Step enabled/i));
      await user.click(screen.getByRole('button', { name: /Save/i }));

      await waitFor(() => expect(confirmMock).toHaveBeenCalledTimes(1));
      // Not even the other form fields are saved: the user backed out.
      expect(
        proposalProtectedCallsWorkflowStepsPartialUpdate,
      ).not.toHaveBeenCalled();
    });

    it('offers no switch at all on a mandatory step', async () => {
      const decision = {
        ...baseStep,
        step: 'allocation_decision',
        is_enabled: true,
        responsible_role: 'call_manager',
      };

      renderDialog({
        resolve: {
          call: baseCall,
          step: decision,
          steps: [decision],
          refetch: vi.fn(),
        },
      });

      // The padlock on the table row already says it is mandatory; a switch
      // that can only be refused is noise.
      expect(
        await screen.findByText(/Configure step: Allocation decision/i),
      ).toBeInTheDocument();
      expect(screen.queryByLabelText(/Step enabled/i)).not.toBeInTheDocument();
    });

    it('offers no switch on a step another step toggles', async () => {
      const award = {
        ...baseStep,
        step: 'award_response',
        is_enabled: true,
        responsible_role: 'applicant',
      };

      renderDialog({
        resolve: {
          call: baseCall,
          step: award,
          steps: [award],
          refetch: vi.fn(),
        },
      });

      // Allocation decision's "Include award response" owns this step; a
      // switch here would leave that flag on while the step is off.
      expect(
        await screen.findByText(/Configure step: Award response/i),
      ).toBeInTheDocument();
      expect(screen.queryByLabelText(/Step enabled/i)).not.toBeInTheDocument();
    });

    it('reconciles the table when the cascade lands but the step write fails', async () => {
      const user = userEvent.setup();
      const refetch = vi.fn();
      // Fields saved, the dependent goes off, then this step's own disable
      // rejects: the row behind the dialog is now wrong until something
      // refetches.
      vi.mocked(proposalProtectedCallsWorkflowStepsPartialUpdate)
        .mockResolvedValueOnce({} as any)
        .mockResolvedValueOnce({} as any)
        .mockRejectedValueOnce(new Error('boom'));
      const { expert, panel } = expertWithPanel();

      renderDialog({
        resolve: {
          call: baseCall,
          step: expert,
          steps: [expert, panel],
          refetch,
        },
      });

      await user.click(await screen.findByLabelText(/Step enabled/i));
      await user.click(screen.getByRole('button', { name: /Save/i }));

      await waitFor(() => expect(refetch).toHaveBeenCalled());
      expect(
        proposalProtectedCallsWorkflowStepsPartialUpdate,
      ).toHaveBeenCalledTimes(3);
    });

    it('disables no dependent when the form itself is rejected', async () => {
      const user = userEvent.setup();
      const refetch = vi.fn();
      vi.mocked(
        proposalProtectedCallsWorkflowStepsPartialUpdate,
      ).mockRejectedValueOnce(new Error('boom'));
      const { expert, panel } = expertWithPanel();

      renderDialog({
        resolve: {
          call: baseCall,
          step: expert,
          steps: [expert, panel],
          refetch,
        },
      });

      await user.click(await screen.findByLabelText(/Step enabled/i));
      await user.click(screen.getByRole('button', { name: /Save/i }));

      await waitFor(() => expect(refetch).toHaveBeenCalled());
      // Only the rejected field write went out: Panel review was never
      // touched, so the failed save left the workflow as it was.
      const calls = vi.mocked(proposalProtectedCallsWorkflowStepsPartialUpdate)
        .mock.calls;
      expect(calls).toHaveLength(1);
      expect(calls[0][0].path.obj_uuid).toBe('step-uuid');
    });
  });
});
