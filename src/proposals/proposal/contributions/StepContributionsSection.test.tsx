import { screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  proposalProposalsContributionsList,
  proposalProposalsResourcesList,
  proposalProposalsStepChecklistResponsesList,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { StepContributionsSection } from './StepContributionsSection';

vi.mock('../StepChecklistSection', () => ({
  StepChecklistSection: () => <div>Step form</div>,
}));

const proposal = { uuid: 'proposal-1' } as any;

const step = {
  call_step_uuid: 'step-ta',
  step_name: 'Technical assessment',
  status: 'active',
  per_requested_offering: true,
  checklist_status: { has_checklist: true },
} as any;

const slot = (overrides: Record<string, unknown>) => ({
  call_step_uuid: 'step-ta',
  is_per_offering: true,
  contributor_full_name: null,
  status: 'pending',
  outcome: '',
  conditions: '',
  comment: '',
  can_fill: false,
  ...overrides,
});

const page = (data: any[]) => Promise.resolve({ data }) as any;

describe('StepContributionsSection', () => {
  beforeEach(() => {
    vi.mocked(proposalProposalsStepChecklistResponsesList).mockImplementation(
      () => page([]),
    );
  });

  it('shows one card per requested offering, fillable only by its team', async () => {
    vi.mocked(proposalProposalsContributionsList).mockImplementation(() =>
      page([
        slot({ uuid: 'c-hpc', offering_name: 'HPC', can_fill: true }),
        slot({ uuid: 'c-gpu', offering_name: 'GPU' }),
      ]),
    );

    renderWithProviders(
      <StepContributionsSection proposal={proposal} workflowStates={[step]} />,
    );

    const cards = await screen.findAllByTestId('step-contribution');
    expect(cards).toHaveLength(2);
    expect(
      within(cards[0]).getByRole('button', { name: /Submit contribution/ }),
    ).toBeInTheDocument();
    expect(
      within(cards[1]).queryByRole('button', { name: /Submit contribution/ }),
    ).not.toBeInTheDocument();
  });

  it('tells the team what the proposal asks of its offering and how to answer', async () => {
    vi.mocked(proposalProposalsResourcesList).mockImplementation(() =>
      page([
        {
          requested_offering: {
            uuid: 'ro-hpc',
            components: [
              {
                type: 'cpu_hours',
                name: 'CPU Core Hours',
                measured_unit: 'hours',
              },
            ],
          },
          limits: { cpu_hours: 400000 },
        },
      ]),
    );
    vi.mocked(proposalProposalsContributionsList).mockImplementation(() =>
      page([
        slot({
          uuid: 'c-hpc',
          offering_name: 'HPC',
          requested_offering_uuid: 'ro-hpc',
          can_fill: true,
        }),
      ]),
    );

    renderWithProviders(
      <StepContributionsSection
        proposal={proposal}
        workflowStates={[
          {
            ...step,
            step_description: 'Assess whether the proposal can run there.',
            contribution_outcomes: [
              'accepted',
              'conditionally_accepted',
              'rejected',
            ],
          },
        ]}
      />,
    );

    // Said once, in the box of the one who fills the card.
    expect(
      await screen.findAllByText('Assess whether the proposal can run there.'),
    ).toHaveLength(1);
    const requested = await screen.findByTestId('contribution-requested');
    expect(requested).toHaveTextContent('Requested from HPC');
    expect(requested).toHaveTextContent('CPU Core Hours: 400,000 hours');
    const guidance = screen.getByTestId('contribution-guidance');
    expect(guidance).toHaveTextContent(
      'Assess whether the proposal can run there.',
    );
    expect(guidance).toHaveTextContent('Fill in the form, then submit one of:');
    expect(within(guidance).getByText('Conditionally accepted')).toBeVisible();
  });

  it('keeps a paused slot on a running step, and drops a lapsed one once it ended', async () => {
    vi.mocked(proposalProposalsContributionsList).mockImplementation(() =>
      page([
        slot({
          uuid: 'c-paused',
          offering_name: 'HPC',
          status: 'expired',
          can_fill: true,
          submitted_at: null,
        }),
        slot({
          uuid: 'c-lapsed',
          call_step_uuid: 'step-done',
          offering_name: 'GPU',
          status: 'expired',
          submitted_at: null,
        }),
      ]),
    );

    renderWithProviders(
      <StepContributionsSection
        proposal={proposal}
        workflowStates={[
          step,
          { ...step, call_step_uuid: 'step-done', status: 'completed' },
        ]}
      />,
    );

    const cards = await screen.findAllByTestId('step-contribution');
    expect(cards).toHaveLength(1);
    expect(within(cards[0]).getByText('HPC')).toBeInTheDocument();
    expect(within(cards[0]).getByText('Paused')).toBeInTheDocument();
    // Paused is not open: nothing to fill until it resumes.
    expect(
      within(cards[0]).queryByRole('button', { name: /Submit contribution/ }),
    ).not.toBeInTheDocument();
  });

  it('shows the outcome and conditions of a submitted contribution', async () => {
    vi.mocked(proposalProposalsContributionsList).mockImplementation(() =>
      page([
        slot({
          uuid: 'c-hpc',
          offering_name: 'HPC',
          status: 'submitted',
          outcome: 'conditionally_accepted',
          conditions: 'At most 512 nodes per job',
          contributor_uuid: 'user-alice',
          contributor_full_name: 'Alice Manager',
        }),
      ]),
    );

    renderWithProviders(
      <StepContributionsSection proposal={proposal} workflowStates={[step]} />,
    );

    expect(
      await screen.findByText('Conditionally accepted'),
    ).toBeInTheDocument();
    expect(screen.getByText('At most 512 nodes per job')).toBeInTheDocument();
    expect(screen.getByText('Submitted by Alice Manager')).toBeInTheDocument();
  });

  it('does not name a contributor the viewer may not know', async () => {
    vi.mocked(proposalProposalsContributionsList).mockImplementation(() =>
      page([
        slot({
          uuid: 'c-hpc',
          offering_name: 'HPC',
          status: 'submitted',
          outcome: 'accepted',
          contributor_uuid: null,
          contributor_full_name: 'Contributor',
          submitted_at: '2026-01-02T10:00:00Z',
        }),
      ]),
    );

    renderWithProviders(
      <StepContributionsSection proposal={proposal} workflowStates={[step]} />,
    );

    const card = await screen.findByTestId('step-contribution');
    expect(within(card).getByText(/^Submitted /)).toBeInTheDocument();
    expect(within(card).queryByText(/Submitted by/)).not.toBeInTheDocument();
  });

  it("shows a blind step's contributors by their labels", async () => {
    vi.mocked(proposalProposalsContributionsList).mockImplementation(() =>
      page([
        slot({
          uuid: 'c-1',
          is_per_offering: false,
          status: 'submitted',
          contributor_uuid: null,
          contributor_full_name: 'Contributor 1',
          comment: 'Agree.',
        }),
        slot({
          uuid: 'c-2',
          is_per_offering: false,
          status: 'submitted',
          contributor_uuid: null,
          contributor_full_name: 'Contributor 2',
          comment: 'Disagree.',
        }),
      ]),
    );

    renderWithProviders(
      <StepContributionsSection
        proposal={proposal}
        workflowStates={[{ ...step, per_requested_offering: false }]}
      />,
    );

    const cards = await screen.findAllByTestId('step-contribution');
    expect(cards).toHaveLength(2);
    expect(within(cards[0]).getByText('Contributor 1')).toBeInTheDocument();
    expect(within(cards[1]).getByText('Contributor 2')).toBeInTheDocument();
    expect(screen.queryByText(/Submitted by/)).not.toBeInTheDocument();
  });

  it('offers no submission on a submitted contribution', async () => {
    vi.mocked(proposalProposalsContributionsList).mockImplementation(() =>
      page([
        slot({
          uuid: 'c-hpc',
          offering_name: 'HPC',
          status: 'submitted',
          outcome: 'accepted',
          can_fill: true,
        }),
      ]),
    );

    renderWithProviders(
      <StepContributionsSection proposal={proposal} workflowStates={[step]} />,
    );

    const card = await screen.findByTestId('step-contribution');
    expect(
      within(card).queryByRole('button', { name: /Submit contribution/ }),
    ).not.toBeInTheDocument();
  });

  it('offers no submission once the step is over', async () => {
    vi.mocked(proposalProposalsContributionsList).mockImplementation(() =>
      page([slot({ uuid: 'c-hpc', offering_name: 'HPC', can_fill: true })]),
    );

    renderWithProviders(
      <StepContributionsSection
        proposal={proposal}
        workflowStates={[{ ...step, status: 'completed' }]}
      />,
    );

    const card = await screen.findByTestId('step-contribution');
    expect(
      within(card).queryByRole('button', { name: /Submit contribution/ }),
    ).not.toBeInTheDocument();
  });

  it('renders nothing without contributions', async () => {
    vi.mocked(proposalProposalsContributionsList).mockImplementation(() =>
      page([]),
    );

    renderWithProviders(
      <StepContributionsSection proposal={proposal} workflowStates={[step]} />,
    );

    await vi.waitFor(() =>
      expect(proposalProposalsContributionsList).toHaveBeenCalled(),
    );
    expect(screen.queryByTestId('step-contribution')).not.toBeInTheDocument();
  });
});

describe('StepContributionsSection on a step only the lead writes', () => {
  const leadOnlyStep = {
    call_step_uuid: 'step-cr',
    step_name: 'Consolidated report',
    status: 'active',
    per_requested_offering: false,
    contributors_lead_only: true,
    checklist_status: { has_checklist: true },
  } as any;

  beforeEach(() => {
    vi.mocked(proposalProposalsStepChecklistResponsesList).mockImplementation(
      () => page([]),
    );
  });

  it("shows the lead their slot, saying it is the lead's", async () => {
    vi.mocked(proposalProposalsContributionsList).mockImplementation(() =>
      page([
        slot({
          uuid: 'c-lead',
          call_step_uuid: 'step-cr',
          is_per_offering: false,
          contributor_full_name: 'Lena Lead',
          can_fill: true,
        }),
      ]),
    );

    renderWithProviders(
      <StepContributionsSection
        proposal={proposal}
        workflowStates={[leadOnlyStep]}
      />,
    );

    const cards = await screen.findAllByTestId('step-contribution');
    expect(cards).toHaveLength(1);
    expect(
      screen.getByText('One contribution, written by the lead of the role.'),
    ).toBeInTheDocument();
  });

  it('shows a holder who is not the lead no slot', async () => {
    // The backend makes the second rapporteur no slot; a slot withdrawn from
    // an earlier lead before they submitted is no work either.
    vi.mocked(proposalProposalsContributionsList).mockImplementation(() =>
      page([
        slot({
          uuid: 'c-old',
          call_step_uuid: 'step-cr',
          is_per_offering: false,
          contributor_full_name: 'Sam Second',
          status: 'withdrawn',
        }),
      ]),
    );

    renderWithProviders(
      <StepContributionsSection
        proposal={proposal}
        workflowStates={[leadOnlyStep]}
      />,
    );

    await vi.waitFor(() =>
      expect(proposalProposalsContributionsList).toHaveBeenCalled(),
    );
    expect(screen.queryByTestId('step-contribution')).not.toBeInTheDocument();
  });
});

describe('StepContributionsSection on steps shown elsewhere', () => {
  beforeEach(() => {
    vi.mocked(proposalProposalsStepChecklistResponsesList).mockImplementation(
      () => page([]),
    );
  });

  const personStep = (overrides: Record<string, unknown>) =>
    ({
      call_step_uuid: 'step-x',
      step_name: 'Statement',
      status: 'completed',
      kind: 'applicant_action',
      outcome_set: 'submitted',
      input_step_uuids: [],
      checklist_status: { has_checklist: true },
      ...overrides,
    }) as any;

  const person = (overrides: Record<string, unknown>) =>
    slot({
      call_step_uuid: 'step-x',
      is_per_offering: false,
      contributor_full_name: 'Niels Bohr',
      ...overrides,
    });

  it('leaves out the applicant steps, shown on their own cards', async () => {
    vi.mocked(proposalProposalsContributionsList).mockImplementation(() =>
      page([
        person({ uuid: 'c-statement', status: 'submitted' }),
        person({
          uuid: 'c-response',
          call_step_uuid: 'step-response',
          status: 'submitted',
        }),
      ]),
    );
    renderWithProviders(
      <StepContributionsSection
        proposal={proposal}
        workflowStates={[
          personStep({}),
          personStep({
            call_step_uuid: 'step-response',
            step_name: 'Response to reviews',
            input_step_uuids: ['step-review'],
          }),
        ]}
      />,
    );
    await vi.waitFor(() =>
      expect(proposalProposalsContributionsList).toHaveBeenCalled(),
    );
    expect(
      screen.queryByText('Statement: contributions'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Response to reviews: contributions'),
    ).not.toBeInTheDocument();
  });

  it('leaves out reviews and slots taken out before any work', async () => {
    vi.mocked(proposalProposalsContributionsList).mockImplementation(() =>
      page([
        person({
          uuid: 'c-review',
          review_uuid: 'review-1',
          status: 'submitted',
        }),
        person({
          uuid: 'c-withdrawn',
          contributor_full_name: 'Barbara McClintock',
          status: 'withdrawn',
          submitted_at: null,
        }),
        person({
          uuid: 'c-done',
          contributor_full_name: 'John von Neumann',
          status: 'submitted',
          submitted_at: '2026-10-01T10:00:00Z',
        }),
      ]),
    );
    renderWithProviders(
      <StepContributionsSection
        proposal={proposal}
        workflowStates={[
          personStep({ kind: 'assessment', step_name: 'Individual report' }),
        ]}
      />,
    );
    const cards = await screen.findAllByTestId('step-contribution');
    expect(cards).toHaveLength(1);
    expect(within(cards[0]).getByText('John von Neumann')).toBeInTheDocument();
  });

  it('offers the delegate to accept or decline, and the holder to take it back', async () => {
    vi.mocked(proposalProposalsContributionsList).mockImplementation(() =>
      page([
        slot({
          uuid: 'c-hpc',
          offering_name: 'HPC',
          delegate_uuid: 'user-tr',
          delegate_full_name: 'Tina Reviewer',
          can_accept: true,
          delegation_candidates: [],
        }),
        slot({
          uuid: 'c-gpu',
          offering_name: 'GPU',
          delegate_uuid: 'user-tr2',
          delegate_full_name: 'Tom Reviewer',
          can_delegate: true,
          delegation_candidates: [{ uuid: 'user-tr2', full_name: 'Tom' }],
        }),
      ]),
    );

    renderWithProviders(
      <StepContributionsSection proposal={proposal} workflowStates={[step]} />,
    );

    const cards = await screen.findAllByTestId('step-contribution');
    expect(within(cards[0]).getByText(/Handed to you/)).toBeInTheDocument();
    expect(
      within(cards[0]).getByRole('button', { name: /Accept/ }),
    ).toBeInTheDocument();
    expect(
      within(cards[0]).getByRole('button', { name: /Decline/ }),
    ).toBeInTheDocument();
    expect(
      within(cards[0]).queryByRole('button', { name: /Hand on/ }),
    ).not.toBeInTheDocument();

    expect(
      within(cards[1]).getByText(
        'Handed to Tom Reviewer, awaiting their answer',
      ),
    ).toBeInTheDocument();
    expect(
      within(cards[1]).getByRole('button', { name: /Take back/ }),
    ).toBeInTheDocument();
    expect(
      within(cards[1]).getByRole('button', { name: /Hand on/ }),
    ).toBeInTheDocument();
    expect(
      within(cards[1]).queryByRole('button', { name: /Accept/ }),
    ).not.toBeInTheDocument();
  });
});
