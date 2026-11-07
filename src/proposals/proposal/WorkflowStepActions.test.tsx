import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  proposalProposalsReopenDecision,
  proposalProposalsWorkflowStatesList,
} from 'waldur-js-client';

import { ENV } from '@/core/config';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { ReopenDecisionDialog } from '../workflow/ReopenDecisionDialog';

import { WorkflowStepActions } from './WorkflowStepActions';

const proposal = {
  uuid: 'proposal-uuid',
  call_uuid: 'call-uuid',
  call_managing_organisation_uuid: 'org-uuid',
  created_by_uuid: 'applicant-uuid',
  awaiting_manual_advance: false,
  decision_held: true,
} as any;

const onCall = (role_name: string) => ({
  role_name,
  scope_type: 'call',
  scope_uuid: 'call-uuid',
  customer_uuid: 'customer-uuid',
});

const callManager = {
  uuid: 'manager-uuid',
  permissions: [onCall('CALL.MANAGER')],
};

const renderActions = (props: Partial<typeof proposal> = {}) =>
  renderWithProviders(
    <WorkflowStepActions
      proposal={{ ...proposal, ...props }}
      refetch={vi.fn()}
    />,
  );

const reopenButton = () =>
  screen.queryByRole('button', { name: /Reopen decision/ });

describe('WorkflowStepActions reopen decision', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
      {
        name: 'CALL.MANAGER',
        permissions: [
          PermissionEnum.UPDATE_CALL,
          PermissionEnum.APPROVE_AND_REJECT_PROPOSALS,
        ],
      },
      {
        name: 'CALL.REVIEWER',
        permissions: [PermissionEnum.APPROVE_AND_REJECT_PROPOSALS],
      },
    ] as any);
    vi.mocked(proposalProposalsWorkflowStatesList).mockResolvedValue({
      data: [],
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.mocked(useUser).mockReturnValue({} as any);
  });

  it('is offered to a call manager while the decision is held', () => {
    vi.mocked(useUser).mockReturnValue(callManager as any);
    renderActions();
    expect(reopenButton()).toBeInTheDocument();
  });

  it('is offered to staff', () => {
    vi.mocked(useUser).mockReturnValue({
      uuid: 'staff',
      is_staff: true,
    } as any);
    renderActions();
    expect(reopenButton()).toBeInTheDocument();
  });

  it('is not offered when no decision is held', () => {
    vi.mocked(useUser).mockReturnValue(callManager as any);
    renderActions({ decision_held: false });
    expect(reopenButton()).not.toBeInTheDocument();
    renderActions({ decision_held: null });
    expect(reopenButton()).not.toBeInTheDocument();
  });

  it.each(['results_published', 'closed'])(
    'is not offered once the round is %s',
    (lifecycle_state) => {
      vi.mocked(useUser).mockReturnValue(callManager as any);
      renderActions({ round: { lifecycle_state } });
      expect(reopenButton()).not.toBeInTheDocument();
    },
  );

  it.each(['evaluating', 'deciding'])(
    'is offered while the round is %s',
    (lifecycle_state) => {
      vi.mocked(useUser).mockReturnValue(callManager as any);
      renderActions({ round: { lifecycle_state } });
      expect(reopenButton()).toBeInTheDocument();
    },
  );

  it('is not offered once the round results are adopted', () => {
    vi.mocked(useUser).mockReturnValue(callManager as any);
    renderActions({
      call_adoption_required: true,
      round: { lifecycle_state: 'deciding', adopted_at: '2026-09-15' },
    });
    expect(reopenButton()).not.toBeInTheDocument();
  });

  it('is offered on an adopted round when the call does not require adoption', () => {
    vi.mocked(useUser).mockReturnValue(callManager as any);
    renderActions({
      call_adoption_required: false,
      round: { lifecycle_state: 'deciding', adopted_at: '2026-09-15' },
    });
    expect(reopenButton()).toBeInTheDocument();
  });

  it('is not offered to support, who may only read the held decision', () => {
    vi.mocked(useUser).mockReturnValue({
      uuid: 'support',
      is_support: true,
      permissions: [],
    } as any);
    renderActions();
    expect(reopenButton()).not.toBeInTheDocument();
  });

  it('is not offered to a role without CALL.UPDATE', () => {
    vi.mocked(useUser).mockReturnValue({
      uuid: 'reviewer',
      permissions: [onCall('CALL.REVIEWER')],
    } as any);
    renderActions();
    expect(reopenButton()).not.toBeInTheDocument();
  });

  it('is not offered to an applicant who also manages the call', () => {
    vi.mocked(useUser).mockReturnValue({
      ...callManager,
      uuid: 'applicant-uuid',
    } as any);
    renderActions();
    expect(reopenButton()).not.toBeInTheDocument();
  });

  it('opens the reopen dialog', async () => {
    const user = userEvent.setup();
    vi.mocked(useUser).mockReturnValue(callManager as any);
    renderActions();

    await user.click(reopenButton()!);

    const [component, dialogProps] = vi.mocked(useModal().openDialog).mock
      .lastCall as any;
    expect(component).toBe(ReopenDecisionDialog);
    expect(dialogProps.resolve.proposal.uuid).toBe('proposal-uuid');
  });
});

describe('WorkflowStepActions current step', () => {
  const step = (overrides = {}) => ({
    uuid: 'state-questions',
    step_name: "Rapporteurs' questions",
    status: 'active',
    completer: 'proposal_role',
    ready_to_complete: false,
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
      {
        name: 'CALL.MANAGER',
        permissions: [
          PermissionEnum.UPDATE_CALL,
          PermissionEnum.APPROVE_AND_REJECT_PROPOSALS,
        ],
      },
    ] as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.mocked(useUser).mockReturnValue({} as any);
  });

  const renderFor = (user: any, overrides = {}, props = {}) => {
    vi.mocked(useUser).mockReturnValue(user);
    vi.mocked(proposalProposalsWorkflowStatesList).mockResolvedValue({
      data: [step(overrides)],
    } as any);
    return renderWithProviders(
      <WorkflowStepActions
        proposal={{ ...proposal, decision_held: false }}
        refetch={vi.fn()}
        {...props}
      />,
    );
  };

  it('names the step its actions are for', async () => {
    renderFor(callManager);
    expect(await screen.findByText('Current step')).toBeInTheDocument();
    expect(screen.getByText("Rapporteurs' questions")).toBeInTheDocument();
    expect(
      screen.queryByTestId('step-ready-to-complete'),
    ).not.toBeInTheDocument();
  });

  it('tells the completer once every contribution is in', async () => {
    renderFor(
      { uuid: 'rapporteur', permissions: [] },
      { ready_to_complete: true },
      { completesActiveStep: true },
    );
    expect(
      await screen.findByText('All contributions are in — complete the step.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Complete step/ }),
    ).toBeInTheDocument();
  });

  it('tells the call manager why the step cannot move on', async () => {
    const reason =
      'Nobody holds the panel member role on the call, so nobody but a call manager can complete this step.';
    renderFor(callManager, { completer: 'panel_member', waiting_for: reason });
    expect(await screen.findByTestId('step-waiting-for')).toHaveTextContent(
      reason,
    );
    expect(
      screen.getByRole('button', { name: /Complete step/ }),
    ).toBeInTheDocument();
  });

  it('keeps the reason from an evaluator completing the step', async () => {
    renderFor(
      { uuid: 'rapporteur', permissions: [] },
      { waiting_for: 'Assign more reviewers.' },
      { completesActiveStep: true },
    );
    expect(await screen.findByText('Current step')).toBeInTheDocument();
    expect(screen.queryByTestId('step-waiting-for')).not.toBeInTheDocument();
  });

  it('shows nothing to a viewer with nothing to do', async () => {
    const { container } = renderFor(
      { uuid: 'bystander', permissions: [] },
      { ready_to_complete: true },
    );
    await waitFor(() =>
      expect(proposalProposalsWorkflowStatesList).toHaveBeenCalled(),
    );
    expect(container).toBeEmptyDOMElement();
  });
});

describe('ReopenDecisionDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requires a reason', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReopenDecisionDialog resolve={{ proposal }} />);

    expect(
      screen.getByRole('button', { name: 'Reopen decision' }),
    ).toBeDisabled();
    await user.type(
      screen.getByRole('textbox', { name: /Reason/ }),
      'Board changed it',
    );
    expect(
      screen.getByRole('button', { name: 'Reopen decision' }),
    ).toBeEnabled();
  });

  it('refuses a reason of spaces alone', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReopenDecisionDialog resolve={{ proposal }} />);

    await user.type(screen.getByRole('textbox', { name: /Reason/ }), '   ');
    expect(
      screen.getByRole('button', { name: 'Reopen decision' }),
    ).toBeDisabled();
  });

  it('tells the manager that the applicant team sees the reopening only after publication', () => {
    renderWithProviders(<ReopenDecisionDialog resolve={{ proposal }} />);
    expect(
      screen.getByText(/sees that entry only once the round publishes/),
    ).toBeInTheDocument();
  });

  it('sends the reason without a deadline and refreshes the workflow', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(proposalProposalsReopenDecision).mockResolvedValue({
      data: {},
    } as any);
    const { queryClient } = renderWithProviders(
      <ReopenDecisionDialog resolve={{ proposal, refetch }} />,
    );
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

    await user.type(
      screen.getByRole('textbox', { name: /Reason/ }),
      '  Board changed it ',
    );
    await user.click(screen.getByRole('button', { name: 'Reopen decision' }));

    await waitFor(() =>
      expect(proposalProposalsReopenDecision).toHaveBeenCalledWith({
        path: { uuid: 'proposal-uuid' },
        body: { reason: 'Board changed it', deadline: null },
      }),
    );
    await waitFor(() => expect(refetch).toHaveBeenCalled());
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ['proposalWorkflowStates', 'proposal-uuid'],
    });
  });
});

describe('WorkflowStepActions for the holder of an evaluator role', () => {
  const holder = { uuid: 'holder-uuid', permissions: [] };
  const roleStep = {
    uuid: 'step-uuid',
    status: 'active',
    completer: 'proposal_role',
    completer_proposal_role_uuid: 'role-uuid',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUser).mockReturnValue(holder as any);
  });

  afterEach(() => {
    vi.mocked(useUser).mockReturnValue({} as any);
  });

  const renderAsHolder = (completesActiveStep: boolean) =>
    renderWithProviders(
      <WorkflowStepActions
        proposal={proposal}
        refetch={vi.fn()}
        completesActiveStep={completesActiveStep}
      />,
    );

  it('offers to complete the step their role completes', async () => {
    vi.mocked(proposalProposalsWorkflowStatesList).mockResolvedValue({
      data: [roleStep],
    } as any);
    renderAsHolder(true);
    expect(
      await screen.findByRole('button', { name: /Complete step/ }),
    ).toBeInTheDocument();
    // Rejecting stays with those who manage the call.
    expect(
      screen.queryByRole('button', { name: /Reject/ }),
    ).not.toBeInTheDocument();
  });

  it('offers nothing to someone not holding the role', async () => {
    vi.mocked(proposalProposalsWorkflowStatesList).mockResolvedValue({
      data: [roleStep],
    } as any);
    renderAsHolder(false);
    await waitFor(() =>
      expect(proposalProposalsWorkflowStatesList).toHaveBeenCalled(),
    );
    expect(
      screen.queryByRole('button', { name: /Complete step/ }),
    ).not.toBeInTheDocument();
  });

  it('offers a panel member to complete the assignment step they complete', async () => {
    vi.mocked(proposalProposalsWorkflowStatesList).mockResolvedValue({
      data: [{ ...roleStep, kind: 'assignment', completer: 'panel_member' }],
    } as any);
    renderAsHolder(true);
    expect(
      await screen.findByRole('button', { name: /Complete step/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Reject/ }),
    ).not.toBeInTheDocument();
  });

  it('never offers an applicant step', async () => {
    vi.mocked(proposalProposalsWorkflowStatesList).mockResolvedValue({
      data: [{ ...roleStep, completer: 'applicant' }],
    } as any);
    renderAsHolder(true);
    await waitFor(() =>
      expect(proposalProposalsWorkflowStatesList).toHaveBeenCalled(),
    );
    expect(
      screen.queryByRole('button', { name: /Complete step/ }),
    ).not.toBeInTheDocument();
  });
});

describe('WorkflowStepActions with steps of one stage running at once', () => {
  const technical = {
    uuid: 'technical-uuid',
    step_name: 'Technical assessment',
    status: 'active',
    completer: 'offering_manager',
    stage: 1,
  };
  const panel = {
    uuid: 'panel-uuid',
    step_name: 'Panel review',
    status: 'active',
    completer: 'panel_member',
    stage: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
      {
        name: 'CALL.MANAGER',
        permissions: [
          PermissionEnum.UPDATE_CALL,
          PermissionEnum.APPROVE_AND_REJECT_PROPOSALS,
        ],
      },
    ] as any);
    vi.mocked(proposalProposalsWorkflowStatesList).mockResolvedValue({
      data: [technical, panel],
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.mocked(useUser).mockReturnValue({} as any);
  });

  it('gives the call manager a card for each step', async () => {
    vi.mocked(useUser).mockReturnValue(callManager as any);
    renderWithProviders(
      <WorkflowStepActions
        proposal={{ ...proposal, decision_held: false }}
        refetch={vi.fn()}
      />,
    );
    expect(await screen.findByText('Technical assessment')).toBeInTheDocument();
    expect(screen.getByText('Panel review')).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: /Complete step/ }),
    ).toHaveLength(2);
  });

  it('offers an evaluator only the step they complete', async () => {
    vi.mocked(useUser).mockReturnValue({
      uuid: 'panelist',
      permissions: [],
    } as any);
    renderWithProviders(
      <WorkflowStepActions
        proposal={{ ...proposal, decision_held: false }}
        refetch={vi.fn()}
        completesActiveStep={(step) => step.uuid === 'panel-uuid'}
      />,
    );
    expect(await screen.findByText('Panel review')).toBeInTheDocument();
    expect(screen.queryByText('Technical assessment')).not.toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: /Complete step/ }),
    ).toHaveLength(1);
  });
});

describe('WorkflowStepActions request changes', () => {
  const activeStep = {
    uuid: 'step-uuid',
    status: 'active',
    step_name: 'Administrative check',
    completer: 'call_manager',
    allows_change_requests: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
      {
        name: 'CALL.MANAGER',
        permissions: [
          PermissionEnum.UPDATE_CALL,
          PermissionEnum.APPROVE_AND_REJECT_PROPOSALS,
        ],
      },
    ] as any);
    vi.mocked(proposalProposalsWorkflowStatesList).mockResolvedValue({
      data: [activeStep],
    } as any);
    vi.mocked(useUser).mockReturnValue(callManager as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.mocked(useUser).mockReturnValue({} as any);
  });

  it('is offered on a step that allows it', async () => {
    renderActions({ state: 'in_review', decision_held: false });
    expect(
      await screen.findByRole('button', { name: /Request changes/ }),
    ).toBeInTheDocument();
  });

  it('waits on the applicant while a request is open', async () => {
    renderActions({
      state: 'in_review',
      decision_held: false,
      open_change_requests: [
        {
          uuid: 'request-uuid',
          step_uuid: 'step-uuid',
          message: 'Attach the letter',
          unlocked_parts: ['documents'],
          due_at: null,
        },
      ],
    });
    expect(await screen.findByText('Attach the letter')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Request changes/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Complete step/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Cancel request for changes/ }),
    ).toBeInTheDocument();
  });
});

describe('WorkflowStepActions request changes beside another step', () => {
  const technical = {
    uuid: 'technical-uuid',
    step_name: 'Technical assessment',
    status: 'active',
    completer: 'offering_manager',
    allows_change_requests: true,
    stage: 1,
  };
  const panel = {
    uuid: 'panel-uuid',
    step_name: 'Panel review',
    status: 'active',
    completer: 'panel_member',
    allows_change_requests: true,
    stage: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
      {
        name: 'CALL.MANAGER',
        permissions: [
          PermissionEnum.UPDATE_CALL,
          PermissionEnum.APPROVE_AND_REJECT_PROPOSALS,
        ],
      },
    ] as any);
    vi.mocked(proposalProposalsWorkflowStatesList).mockResolvedValue({
      data: [technical, panel],
    } as any);
    vi.mocked(useUser).mockReturnValue(callManager as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.mocked(useUser).mockReturnValue({} as any);
  });

  const panelRequest = {
    uuid: 'request-uuid',
    step_uuid: 'panel-uuid',
    step_name: 'Panel review',
    message: 'Attach the letter',
    unlocked_parts: ['documents'],
    due_at: null,
  };

  it('holds only the step that asked', async () => {
    renderActions({
      state: 'in_review',
      decision_held: false,
      open_change_requests: [panelRequest],
    });
    expect(await screen.findByText('Attach the letter')).toBeInTheDocument();
    expect(screen.getAllByText('Attach the letter')).toHaveLength(1);
    // The technical assessment is decided as usual.
    expect(
      screen.getAllByRole('button', { name: /Complete step/ }),
    ).toHaveLength(1);
    expect(
      screen.getAllByRole('button', { name: /Cancel request for changes/ }),
    ).toHaveLength(1);
    // And may ask for changes of its own meanwhile.
    expect(
      screen.getByRole('button', { name: /Request changes/ }),
    ).toBeEnabled();
  });

  it('shows each step its own request when both asked', async () => {
    renderActions({
      state: 'in_review',
      decision_held: false,
      open_change_requests: [
        panelRequest,
        {
          uuid: 'other-request-uuid',
          step_uuid: 'technical-uuid',
          step_name: 'Technical assessment',
          message: 'Describe the GPU workload',
          unlocked_parts: ['resources'],
          due_at: null,
        },
      ],
    });
    expect(await screen.findByText('Attach the letter')).toBeInTheDocument();
    expect(screen.getByText('Describe the GPU workload')).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: /Cancel request for changes/ }),
    ).toHaveLength(2);
    expect(
      screen.queryByRole('button', { name: /Complete step/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Request changes/ }),
    ).not.toBeInTheDocument();
  });
});
