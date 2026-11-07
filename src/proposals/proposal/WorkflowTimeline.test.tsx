import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalProposalsWorkflowStatesList } from 'waldur-js-client';

import { showsWorkflowSteps } from '@/proposals/presentation';
import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { WorkflowTimeline } from './WorkflowTimeline';

vi.mock('@/proposals/presentation', () => ({
  usesCallVocabulary: () => true,
  showsWorkflowSteps: vi.fn(() => true),
}));

const APPLICANT_UUID = 'applicant-uuid';
const PROMPT = 'Your confirmation is needed before resources are set up.';

const proposal = {
  uuid: 'proposal-1',
  state: 'accepted',
  created_by_uuid: APPLICANT_UUID,
} as any;

const step = (overrides: Record<string, any>) => ({
  uuid: `${overrides.step}-uuid`,
  step_name: overrides.step,
  status: 'completed',
  applicant_visible: true,
  rejection_reason: null,
  responsible_role: null,
  outcome: null,
  deadline: null,
  completed_at: null,
  ...overrides,
});

const atAwardResponse = [
  step({
    step: 'allocation_decision',
    kind: 'decision',
    outcome_set: 'approval',
    is_allocation_decision: true,
    step_name: 'Allocation decision',
  }),
  step({
    step: 'award_response',
    kind: 'applicant_action',
    outcome_set: 'acceptance',
    step_name: 'Award response',
    status: 'active',
  }),
];

/**
 * Opens a checkpoint's popover and returns the panel. A step that is a
 * button opens it itself, named by what it shows; one that is not leaves it
 * to the name's own button.
 */
const openStep = async (name: string) => {
  await userEvent.click(
    await screen.findByRole('button', {
      name: (accessibleName) =>
        accessibleName === `${name}: step details` ||
        accessibleName === name ||
        accessibleName.startsWith(`${name} `),
    }),
  );
  return screen.findByRole('dialog');
};

const renderAs = (userUuid: string, showDetails = false) => {
  vi.mocked(useUser).mockReturnValue({ uuid: userUuid } as any);
  return renderWithProviders(
    <WorkflowTimeline proposal={proposal} showDetails={showDetails} />,
  );
};

describe('WorkflowTimeline award confirmation prompt', () => {
  beforeEach(() => {
    vi.mocked(proposalProposalsWorkflowStatesList).mockResolvedValue({
      data: atAwardResponse,
    } as any);
  });

  it('asks the applicant to confirm at the award-response step', async () => {
    renderAs(APPLICANT_UUID);
    expect(await screen.findByText(PROMPT)).toBeInTheDocument();
  });

  it('does not show the prompt to a reviewer', async () => {
    renderAs('reviewer-uuid');
    expect(await screen.findByText('Award response')).toBeInTheDocument();
    expect(screen.queryByText(PROMPT)).not.toBeInTheDocument();
  });

  it('does not show the prompt to a call manager', async () => {
    renderAs('call-manager-uuid', true);
    expect(await screen.findByText('Award response')).toBeInTheDocument();
    expect(screen.queryByText(PROMPT)).not.toBeInTheDocument();
  });

  it('does not show the prompt to a call manager reading the applicant view', async () => {
    renderAs('call-manager-uuid');
    expect(await screen.findByText('Award response')).toBeInTheDocument();
    expect(screen.queryByText(PROMPT)).not.toBeInTheDocument();
  });
});

describe('WorkflowTimeline on a call that evaluates at the round cut-off', () => {
  const CUTOFF_NOTE = 'Submitted — evaluation starts after the round cut-off.';
  const submitted = { ...proposal, state: 'submitted' };
  const waiting = [
    step({
      step: 'administrative_check',
      kind: 'decision',
      outcome_set: 'eligibility',
      step_name: 'Administrative check',
      status: 'pending',
    }),
    step({
      step: 'allocation_decision',
      kind: 'decision',
      outcome_set: 'approval',
      is_allocation_decision: true,
      step_name: 'Allocation decision',
      status: 'pending',
    }),
  ];

  const renderTimeline = (
    evaluationStart: 'at_cutoff' | 'on_submission',
    target = submitted,
    showDetails = false,
  ) => {
    vi.mocked(useUser).mockReturnValue({ uuid: APPLICANT_UUID } as any);
    return renderWithProviders(
      <WorkflowTimeline
        proposal={target}
        showDetails={showDetails}
        evaluationStart={evaluationStart}
      />,
    );
  };

  beforeEach(() => {
    vi.mocked(proposalProposalsWorkflowStatesList).mockResolvedValue({
      data: waiting,
    } as any);
  });

  it('tells the applicant that evaluation waits for the cut-off', async () => {
    renderTimeline('at_cutoff');
    expect(await screen.findByText(CUTOFF_NOTE)).toBeInTheDocument();
    // No step is marked as under way.
    expect(await screen.findByText('Administrative check')).toBeInTheDocument();
    expect(screen.queryByRole('button', { current: 'step' })).toBeNull();
  });

  it('says the same on the coarse tracker when no steps are shown', async () => {
    vi.mocked(proposalProposalsWorkflowStatesList).mockResolvedValue({
      data: [],
    } as any);
    renderTimeline('at_cutoff');
    expect(await screen.findByText(CUTOFF_NOTE)).toBeInTheDocument();
  });

  it('does not say it on a call that evaluates on submission', async () => {
    renderTimeline('on_submission');
    expect(await screen.findByText('Administrative check')).toBeInTheDocument();
    expect(screen.queryByText(CUTOFF_NOTE)).not.toBeInTheDocument();
    // Here the stepper marks the first pending step as the current one.
    expect(screen.queryByRole('button', { current: 'step' })).not.toBeNull();
  });

  it('does not say it once review has started', async () => {
    vi.mocked(proposalProposalsWorkflowStatesList).mockResolvedValue({
      data: [{ ...waiting[0], status: 'active' }, waiting[1]],
    } as any);
    renderTimeline('at_cutoff', { ...proposal, state: 'in_review' });
    expect(
      await screen.findByText('Your proposal is being reviewed.'),
    ).toBeInTheDocument();
    expect(screen.queryByText(CUTOFF_NOTE)).not.toBeInTheDocument();
  });
});

describe('WorkflowTimeline with a decision held for the round', () => {
  const HELD_NOTE = 'Held until the round publishes results';
  const inReview = { ...proposal, state: 'in_review' };
  // The call team's payload: the decision is recorded, the next step has not
  // started.
  const held = [
    step({
      step: 'allocation_decision',
      kind: 'decision',
      outcome_set: 'approval',
      is_allocation_decision: true,
      step_name: 'Allocation decision',
      outcome: 'declined',
    }),
    step({
      step: 'award_response',
      kind: 'applicant_action',
      outcome_set: 'acceptance',
      step_name: 'Award response',
      status: 'pending',
    }),
  ];

  beforeEach(() => {
    vi.mocked(proposalProposalsWorkflowStatesList).mockResolvedValue({
      data: held,
    } as any);
    vi.mocked(useUser).mockReturnValue({ uuid: 'call-manager-uuid' } as any);
  });

  it('marks the decision as held and presents no later step as current', async () => {
    renderWithProviders(
      <WorkflowTimeline
        proposal={{ ...inReview, decision_held: true }}
        showDetails
      />,
    );
    expect(
      await screen.findByText('Not awarded (tentative)'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { current: 'step' })).toBeNull();
    const popover = await openStep('Allocation decision');
    expect(popover).toHaveTextContent(HELD_NOTE);
  });

  // The call team's payload has the decision recorded; the applicant's still
  // shows it under way. Reading the applicant's view, the team must see what
  // the applicant sees, not a tracker that has skipped to the next step.
  it('shows the call team the decision still under way in the applicant view', async () => {
    vi.mocked(proposalProposalsWorkflowStatesList).mockResolvedValue({
      data: held.map((s) =>
        s.step_name === 'Allocation decision'
          ? { ...s, applicant_visible: false }
          : s,
      ),
    } as any);
    renderWithProviders(
      <WorkflowTimeline proposal={{ ...inReview, decision_held: true }} />,
    );
    const current = await screen.findByRole('button', { current: 'step' });
    expect(current).toHaveTextContent('Decision');
    expect(current).not.toHaveTextContent('Award response');
    expect(screen.queryByText(HELD_NOTE)).not.toBeInTheDocument();
    expect(
      screen.queryByText('Not awarded (tentative)'),
    ).not.toBeInTheDocument();
  });

  // A held rejection carries its reason in the call team's payload. On an
  // applicant-visible step it must not paint the applicant's view as failed.
  it('shows a held rejection as still under way in the applicant view', async () => {
    vi.mocked(proposalProposalsWorkflowStatesList).mockResolvedValue({
      data: held.map((s) =>
        s.step_name === 'Allocation decision'
          ? {
              ...s,
              outcome: 'rejected',
              outcome_reason: 'Out of scope',
              rejection_reason: 'Out of scope',
              completed_at: '2026-09-01T10:00:00Z',
              completed_by: 'Call manager',
            }
          : s,
      ),
    } as any);
    renderWithProviders(
      <WorkflowTimeline proposal={{ ...inReview, decision_held: true }} />,
    );
    const current = await screen.findByRole('button', { current: 'step' });
    expect(current).toHaveTextContent('Allocation decision');
    expect(screen.queryByText('Not reached')).not.toBeInTheDocument();
  });

  it('says nothing of a hold when no decision is held', async () => {
    renderWithProviders(
      <WorkflowTimeline
        proposal={{ ...inReview, decision_held: false }}
        showDetails
      />,
    );
    expect(await screen.findByText('Award response')).toBeInTheDocument();
    expect(screen.queryByText(HELD_NOTE)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { current: 'step' })).not.toBeNull();
  });
});

describe('WorkflowTimeline with steps the call named itself', () => {
  // Two steps of one kind, each under the call's own name.
  const reports = [
    step({
      step: 'individual-report',
      kind: 'assessment',
      outcome_set: 'reviewed',
      step_name: 'Individual report',
      completer: 'reviewer',
    }),
    step({
      step: 'consolidated-report',
      kind: 'assessment',
      outcome_set: 'done',
      step_name: 'Consolidated report',
      completer: 'reviewer',
      status: 'active',
    }),
  ];

  beforeEach(() => {
    vi.mocked(proposalProposalsWorkflowStatesList).mockResolvedValue({
      data: reports,
    } as any);
  });

  it('labels each step with its name and marks the one in flight', async () => {
    renderWithProviders(
      <WorkflowTimeline
        proposal={{ ...proposal, state: 'in_review' }}
        showDetails
      />,
    );
    expect(await screen.findByText('Individual report')).toBeInTheDocument();
    const current = await screen.findByRole('button', { current: 'step' });
    expect(current).toHaveTextContent('Consolidated report');
    expect(current).toHaveTextContent('In progress');
    // Who completes it is detail, kept off the tracker.
    expect(current).not.toHaveTextContent('Reviewer');
    const popover = await openStep('Consolidated report');
    expect(popover).toHaveTextContent('Completed by');
    expect(popover).toHaveTextContent('Reviewer');
  });

  it('names the evaluator role that completes a step', async () => {
    vi.mocked(proposalProposalsWorkflowStatesList).mockResolvedValue({
      data: [
        step({
          step: 'panel-report',
          kind: 'assessment',
          outcome_set: 'done',
          step_name: 'Panel report',
          completer: 'proposal_role',
          completer_proposal_role_name: 'Panel chair',
          status: 'active',
        }),
      ],
    } as any);
    renderWithProviders(
      <WorkflowTimeline
        proposal={{ ...proposal, state: 'in_review' }}
        showDetails
      />,
    );
    const popover = await openStep('Panel report');
    expect(popover).toHaveTextContent('Panel chair');
    expect(popover).not.toHaveTextContent('Evaluator role');
  });
});

describe('WorkflowTimeline step descriptions', () => {
  const EXPERT = 'Independent peer review by domain experts with scoring.';
  const PANEL = 'Collective panel evaluation consolidating expert reviews.';
  const INTERNAL = 'Checked against the call team’s own eligibility rules.';

  const steps = (internalStatus: string) => [
    step({
      step: 'expert_review',
      kind: 'assessment',
      outcome_set: 'reviewed',
      step_name: 'Expert review',
      step_description: EXPERT,
    }),
    step({
      step: 'feasibility',
      kind: 'decision',
      outcome_set: 'eligibility',
      step_name: 'Feasibility screen',
      step_description: INTERNAL,
      applicant_visible: false,
      status: internalStatus,
    }),
    step({
      step: 'panel_review',
      kind: 'decision',
      outcome_set: 'approval',
      step_name: 'Panel review',
      step_description: PANEL,
      status: 'pending',
    }),
  ];

  const renderWith = (data: any[], showDetails = false) => {
    vi.mocked(proposalProposalsWorkflowStatesList).mockResolvedValue({
      data,
    } as any);
    vi.mocked(useUser).mockReturnValue({ uuid: APPLICANT_UUID } as any);
    return renderWithProviders(
      <WorkflowTimeline
        proposal={{ ...proposal, state: 'in_review' }}
        showDetails={showDetails}
      />,
    );
  };

  it('keeps every description off the tracker itself', async () => {
    renderWith(steps('completed'), true);
    expect(await screen.findByText('Expert review')).toBeInTheDocument();
    expect(screen.queryByText(EXPERT)).not.toBeInTheDocument();
    expect(screen.queryByText(PANEL)).not.toBeInTheDocument();
    expect(screen.queryByText(INTERNAL)).not.toBeInTheDocument();
  });

  it('tells the applicant what each step they can see is for', async () => {
    renderWith(steps('completed'));
    const popover = await openStep('Panel review');
    expect(within(popover).getByText(PANEL)).toBeInTheDocument();
    expect(screen.queryByText(INTERNAL)).not.toBeInTheDocument();
  });

  it('explains an internal stand-in without the call’s own words', async () => {
    renderWith(
      steps('active').map((s) =>
        s.step_name === 'Feasibility screen'
          ? {
              ...s,
              completer: 'call_manager',
              started_at: '2026-09-01T10:00:00Z',
              deadline: '2026-10-01',
            }
          : s,
      ),
    );
    const current = await screen.findByRole('button', { current: 'step' });
    expect(current).toHaveTextContent('Internal check');
    expect(current).not.toHaveTextContent(
      'A step the call team handles internally.',
    );
    const popover = await openStep('Internal check');
    expect(popover).toHaveTextContent(
      'Internal check' + 'A step the call team handles internally.',
    );
    expect(popover).not.toHaveTextContent('Started');
    expect(popover).not.toHaveTextContent('Due');
    expect(popover).not.toHaveTextContent('Call manager');
    expect(screen.queryByText('Feasibility screen')).not.toBeInTheDocument();
    expect(screen.queryByText(INTERNAL)).not.toBeInTheDocument();
  });

  it('shows the call team every step’s description, status and outcome', async () => {
    renderWith(
      steps('active').map((s) =>
        s.step_name === 'Expert review'
          ? {
              ...s,
              outcome: 'reviewed',
              outcome_reason: 'Scores consolidated.',
              completer: 'reviewer',
              completed_at: '2026-09-01T10:00:00Z',
            }
          : s,
      ),
      true,
    );
    expect(await screen.findByText('Completed · Reviewed')).toBeInTheDocument();
    const popover = await openStep('Expert review');
    expect(within(popover).getByText(EXPERT)).toBeInTheDocument();
    expect(popover).toHaveTextContent('Reviewer');
    expect(popover).toHaveTextContent('Scores consolidated.');
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    const internal = await openStep('Feasibility screen');
    expect(within(internal).getByText(INTERNAL)).toBeInTheDocument();
  });
});

// Where the deployment hides the steps, the coarse tracker is all the
// applicant has; a rejection must still say why.
describe('WorkflowTimeline on a rejected request with the steps hidden', () => {
  const rejected = { ...proposal, state: 'rejected' };
  const REASON = 'Outside the remit of the partition.';
  const stopped = [
    step({
      step: 'administrative_check',
      step_name: 'Administrative check',
      outcome: 'ineligible',
      outcome_reason: REASON,
    }),
    step({
      step: 'technical_assessment',
      step_name: 'Technical assessment',
      status: 'pending',
      applicant_visible: false,
    }),
  ];

  beforeEach(() => {
    vi.mocked(showsWorkflowSteps).mockReturnValue(false);
  });

  afterEach(() => {
    vi.mocked(showsWorkflowSteps).mockReturnValue(true);
  });

  const renderRejected = (data, userUuid = APPLICANT_UUID) => {
    vi.mocked(proposalProposalsWorkflowStatesList).mockResolvedValue({
      data,
    } as any);
    vi.mocked(useUser).mockReturnValue({ uuid: userUuid } as any);
    return renderWithProviders(<WorkflowTimeline proposal={rejected} />);
  };

  it('tells the applicant the reason the step recorded', async () => {
    renderRejected(stopped);
    expect(await screen.findByText(`Reason: ${REASON}`)).toBeInTheDocument();
  });

  it('keeps the reason of a step the call does not show the applicant', async () => {
    renderRejected([
      step({
        step: 'technical_assessment',
        step_name: 'Technical assessment',
        outcome: 'infeasible',
        outcome_reason: 'Internal note.',
        applicant_visible: false,
      }),
    ]);
    expect(await screen.findByText('Decision')).toBeInTheDocument();
    expect(screen.queryByText(/Internal note/)).not.toBeInTheDocument();
  });

  it('does not show the reason to anyone but the applicant', async () => {
    renderRejected(stopped, 'call-manager-uuid');
    expect(await screen.findByText('Decision')).toBeInTheDocument();
    expect(screen.queryByText(`Reason: ${REASON}`)).not.toBeInTheDocument();
  });
});

describe('WorkflowTimeline step buttons', () => {
  beforeEach(() => {
    vi.mocked(proposalProposalsWorkflowStatesList).mockResolvedValue({
      data: atAwardResponse,
    } as any);
  });

  // The step is the button: its name inside may not be a second one.
  it('nests no button inside a step', async () => {
    renderAs('applicant-1', true);
    await screen.findByText('Award response');
    for (const button of screen.getAllByRole('button')) {
      expect(within(button).queryAllByRole('button')).toEqual([]);
    }
  });

  it('closes the open step on a second press', async () => {
    renderAs('applicant-1', true);
    await openStep('Award response');
    await userEvent.click(
      screen.getByRole('button', {
        name: (accessibleName) => accessibleName.startsWith('Award response'),
      }),
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('WorkflowTimeline on a rejected proposal, for the call team', () => {
  const rejected = { ...proposal, state: 'rejected' } as any;
  const steps = [
    step({ step: 'Administrative check', outcome: 'eligible' }),
    step({
      step: 'Expert review',
      outcome: 'rejected',
      outcome_reason: 'Did not meet the required standard.',
      rejection_reason: 'Did not meet the required standard.',
      completed_at: '2026-06-16T12:00:00Z',
    }),
    step({ step: 'Panel review', status: 'pending' }),
  ];

  // The rejected step says it on the tracker; no line under it repeats it.
  it('marks where the proposal stopped on the tracker alone', async () => {
    vi.mocked(useUser).mockReturnValue({ uuid: 'call-manager-uuid' } as any);
    vi.mocked(proposalProposalsWorkflowStatesList).mockResolvedValue({
      data: steps,
    } as any);
    renderWithProviders(<WorkflowTimeline proposal={rejected} showDetails />);
    expect(
      await screen.findByText('Not reached: rejected at Expert review'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/^Rejected at Expert review/)).toBeNull();
  });
});

describe('WorkflowTimeline applicant status labels', () => {
  const checked = (later: Record<string, any>) => [
    step({
      step: 'administrative_check',
      step_name: 'Administrative check',
      outcome: 'eligible',
      status_label: 'Under evaluation',
    }),
    step({
      step: 'award_response',
      kind: 'applicant_action',
      step_name: 'Award response',
      ...later,
    }),
  ];

  const renderWith = (data) => {
    vi.mocked(proposalProposalsWorkflowStatesList).mockResolvedValue({
      data,
    } as any);
    return renderAs(APPLICANT_UUID);
  };

  it('says where the proposal stands under the step it last passed', async () => {
    renderWith(checked({ status: 'pending' }));
    expect(await screen.findByText('Under evaluation')).toBeInTheDocument();
  });

  it('drops that line once the proposal is withdrawn', async () => {
    vi.mocked(proposalProposalsWorkflowStatesList).mockResolvedValue({
      data: checked({ status: 'skipped' }),
    } as any);
    vi.mocked(useUser).mockReturnValue({ uuid: APPLICANT_UUID } as any);
    renderWithProviders(
      <WorkflowTimeline proposal={{ ...proposal, state: 'canceled' }} />,
    );
    expect(await screen.findByText('Administrative check')).toBeInTheDocument();
    expect(screen.queryByText('Under evaluation')).not.toBeInTheDocument();
  });

  it('drops that line once a later step is reached', async () => {
    renderWith(checked({ status: 'completed', outcome: 'accepted' }));
    expect(await screen.findByText('Award response')).toBeInTheDocument();
    expect(screen.queryByText('Under evaluation')).not.toBeInTheDocument();
  });
});

describe('WorkflowTimeline after the award', () => {
  const finalReport = [
    ...atAwardResponse.map((s, index) => ({
      ...s,
      status: 'completed',
      stage: index + 1,
    })),
    step({
      step: 'final_report',
      call_step_uuid: 'final-report-step',
      kind: 'applicant_action',
      step_name: 'Final report',
      run_uuid: 'run-1',
      phase: 'closing',
      completer: 'applicant',
      stage: 3,
      status: 'active',
      deadline: '2026-12-06T12:00:00Z',
    }),
    step({
      step: 'final_report_approval',
      call_step_uuid: 'final-report-approval-step',
      kind: 'decision',
      step_name: 'Final report approval',
      run_uuid: 'run-1',
      phase: 'closing',
      completer: 'call_manager',
      stage: 4,
      status: 'pending',
      applicant_visible: false,
    }),
  ];

  beforeEach(() => {
    vi.mocked(proposalProposalsWorkflowStatesList).mockResolvedValue({
      data: finalReport,
    } as any);
  });

  it('tells the applicant their response is due, not a decision', async () => {
    renderAs(APPLICANT_UUID);
    expect(
      await screen.findByText(/^Your response is due by /),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Decision expected by/)).not.toBeInTheDocument();
  });

  it('does not repeat the run name a step already starts with', async () => {
    renderAs('call-manager-uuid', true);
    expect(
      await screen.findByText('Final report approval'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Final report: Final report/),
    ).not.toBeInTheDocument();
  });
});
