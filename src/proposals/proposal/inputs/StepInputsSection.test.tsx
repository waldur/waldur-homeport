import { screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  proposalProposalsReleasedReportsList,
  proposalProposalsStepChecklistResponsesList,
  proposalProposalsStepInputsList,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import {
  isResponseStep,
  releasableSteps,
  stepsReadByApplicantElsewhere,
  stepsReadThroughResponse,
  stepsShowingInputs,
} from './queries';
import { ReleasedReportsSection } from './ReleasedReportsSection';
import { StepInputsSection } from './StepInputsSection';

vi.mock('../StepChecklistSection', () => ({
  StepChecklistSection: ({ canEdit }) => (
    <div>{canEdit ? 'Response form' : 'Response read-only'}</div>
  ),
}));

const proposal = { uuid: 'proposal-1', name: 'Proposal' } as any;

const responseStep = {
  uuid: 'instance-response',
  call_step_uuid: 'step-response',
  step_name: 'Response to reviews',
  kind: 'applicant_action',
  outcome_set: 'submitted',
  status: 'active',
  input_step_uuids: ['step-review', 'step-questions'],
  checklist_status: { has_checklist: true, unanswered_required_count: 0 },
} as any;

const inputs = [
  {
    step: {
      uuid: 'instance-review',
      step_name: 'Expert review',
      status: 'completed',
      outcome: null,
    },
    reviews: [
      {
        uuid: 'review-1',
        anonymous_reviewer_name: 'Reviewer 1',
        summary_score: 7,
        summary_public_comment: 'The method is sound.',
        comment_team: 'A capable team.',
      },
    ],
    contributions: [],
  },
  {
    step: {
      uuid: 'instance-questions',
      step_name: 'Rapporteur questions',
      status: 'completed',
      outcome: 'done',
    },
    reviews: [],
    contributions: [
      {
        uuid: 'c-1',
        is_per_offering: false,
        contributor_full_name: 'Contributor',
        submitted_at: '2026-10-01T10:00:00Z',
        answers: [
          {
            question_uuid: 'q-1',
            question_description: 'Questions to the applicant',
            answer_display: 'How do you scale?',
          },
        ],
      },
    ],
  },
];

const page = (data: any) => Promise.resolve({ data }) as any;

describe('step inputs helpers', () => {
  it('shows the inputs of every started step that reads earlier ones', () => {
    const steps = [
      { ...responseStep, status: 'completed' },
      {
        kind: 'assessment',
        status: 'completed',
        input_step_uuids: ['step-review'],
      },
      { kind: 'assessment', status: 'active', input_step_uuids: ['x'] },
      { kind: 'decision', status: 'active', input_step_uuids: [] },
      { ...responseStep, status: 'pending' },
    ] as any[];
    expect(stepsShowingInputs(steps)).toEqual([steps[0], steps[1], steps[2]]);
  });

  it('tells a response step from an award response', () => {
    expect(isResponseStep(responseStep)).toBe(true);
    expect(
      isResponseStep({
        kind: 'applicant_action',
        outcome_set: 'acceptance',
        input_step_uuids: ['step-review'],
      } as any),
    ).toBe(false);
    // An applicant step reading nothing is still the applicant's to submit.
    expect(isResponseStep({ ...responseStep, input_step_uuids: [] })).toBe(
      true,
    );
  });

  it('leaves to the applicant the cards of steps only evaluators read', () => {
    const steps = [
      { ...responseStep, status: 'completed' },
      // The rapporteurs' reports read the technical assessment too; the
      // applicant reads nothing of them, so its outcome must stay on its own.
      {
        kind: 'assessment',
        outcome_set: 'done',
        status: 'active',
        input_step_uuids: ['step-technical', 'step-review'],
      },
      {
        ...responseStep,
        uuid: 'later',
        status: 'pending',
        input_step_uuids: ['x'],
      },
    ] as any[];
    expect(stepsReadThroughResponse(steps)).toEqual([
      'step-review',
      'step-questions',
    ]);
  });

  it('shows a started applicant step that reads nothing', () => {
    const plain = { ...responseStep, input_step_uuids: [] };
    expect(stepsShowingInputs([plain])).toEqual([plain]);
    expect(stepsShowingInputs([{ ...plain, status: 'pending' }])).toEqual([]);
  });

  it('reads a released report as feedback, not as contributions', () => {
    const steps = [
      {
        ...responseStep,
        uuid: 'response',
        status: 'completed',
        input_step_uuids: ['step-review'],
      },
      {
        call_step_uuid: 'step-consolidated',
        kind: 'assessment',
        status: 'completed',
        release_to_applicant: true,
        released_at: '2026-10-09T12:00:00Z',
      },
      {
        call_step_uuid: 'step-unreleased',
        kind: 'assessment',
        status: 'completed',
        release_to_applicant: true,
        released_at: null,
      },
    ] as any[];
    expect(stepsReadByApplicantElsewhere(steps)).toEqual([
      'step-review',
      'step-consolidated',
    ]);
  });

  it('offers to release the steps the backend says the viewer may', () => {
    const steps = [
      { release_to_applicant: true, status: 'completed', can_release: true },
      { release_to_applicant: true, status: 'completed', can_release: false },
    ] as any[];
    expect(releasableSteps(steps)).toEqual([steps[0]]);
  });
});

describe('StepInputsSection', () => {
  beforeEach(() => {
    vi.mocked(proposalProposalsStepInputsList).mockImplementation(() =>
      page(inputs),
    );
    vi.mocked(proposalProposalsStepChecklistResponsesList).mockImplementation(
      () => page([]),
    );
  });

  it('shows the applicant the reviews and questions with the response form', async () => {
    renderWithProviders(
      <StepInputsSection
        proposal={proposal}
        steps={[responseStep]}
        isApplicant
      />,
    );
    const outputs = await screen.findAllByTestId('step-input');
    expect(outputs).toHaveLength(2);
    expect(within(outputs[0]).getByText('Reviewer 1')).toBeInTheDocument();
    expect(
      within(outputs[0]).getByText('The method is sound.'),
    ).toBeInTheDocument();
    expect(
      within(outputs[1]).getByText('How do you scale?'),
    ).toBeInTheDocument();
    expect(screen.getByText('Response form')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Submit response/ }),
    ).toBeInTheDocument();
  });

  it('offers the applicant a step that reads no earlier step', async () => {
    vi.mocked(proposalProposalsStepInputsList).mockImplementation(() =>
      page([]),
    );
    renderWithProviders(
      <StepInputsSection
        proposal={proposal}
        steps={[{ ...responseStep, input_step_uuids: [] }]}
        isApplicant
      />,
    );
    expect(await screen.findByText('Response form')).toBeInTheDocument();
    expect(screen.queryAllByTestId('step-input')).toHaveLength(0);
    expect(
      screen.getByRole('button', { name: /Submit response/ }),
    ).toBeInTheDocument();
  });

  it('says when such a step has no form to fill', async () => {
    vi.mocked(proposalProposalsStepInputsList).mockImplementation(() =>
      page([]),
    );
    renderWithProviders(
      <StepInputsSection
        proposal={proposal}
        steps={[
          {
            ...responseStep,
            input_step_uuids: [],
            checklist_status: null,
          },
        ]}
        isApplicant
      />,
    );
    expect(
      await screen.findByText(
        'This step has no form: submitting it only confirms the step is done.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Submit response/ }),
    ).toBeInTheDocument();
  });

  it('keeps a submitted response read-only', async () => {
    renderWithProviders(
      <StepInputsSection
        proposal={proposal}
        steps={[{ ...responseStep, status: 'completed', outcome: 'submitted' }]}
        isApplicant
      />,
    );
    expect(await screen.findByText('Response read-only')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Submit response/ }),
    ).not.toBeInTheDocument();
  });

  it('does not offer the form to the rest of the team', async () => {
    renderWithProviders(
      <StepInputsSection
        proposal={proposal}
        steps={[responseStep]}
        isApplicant={false}
      />,
    );
    expect(
      await screen.findByText("The proposal's applicant submits the response."),
    ).toBeInTheDocument();
    expect(screen.queryByText('Response form')).not.toBeInTheDocument();
  });

  it('shows nothing to a viewer the backend refuses', async () => {
    vi.mocked(proposalProposalsStepInputsList).mockImplementation(
      () => Promise.reject({ response: { status: 403 } }) as any,
    );
    const { container } = renderWithProviders(
      <StepInputsSection
        proposal={proposal}
        steps={[{ ...responseStep, kind: 'assessment' }]}
        isApplicant={false}
      />,
    );
    await vi.waitFor(() =>
      expect(proposalProposalsStepInputsList).toHaveBeenCalled(),
    );
    expect(container).toBeEmptyDOMElement();
  });
});

describe('StepInputsSection on a blind step read as input', () => {
  beforeEach(() => {
    vi.mocked(proposalProposalsStepChecklistResponsesList).mockImplementation(
      () => page([]),
    );
  });

  it('shows an evaluator the labels the authors go by', async () => {
    vi.mocked(proposalProposalsStepInputsList).mockImplementation(() =>
      page([
        {
          step: {
            uuid: 'instance-blind',
            step_name: 'Blind review',
            status: 'completed',
            outcome: null,
          },
          // Reviews carry no reviewer at all, only the label.
          reviews: [
            {
              uuid: 'review-1',
              anonymous_reviewer_name: 'Reviewer 1',
              summary_public_comment: 'Sound.',
            },
            {
              uuid: 'review-2',
              anonymous_reviewer_name: 'Reviewer 2',
              summary_public_comment: 'Weak.',
            },
          ],
          // Contributions keep the label in the name, with no uuid.
          contributions: [
            {
              uuid: 'c-1',
              is_per_offering: false,
              contributor_uuid: null,
              contributor_full_name: 'Contributor 1',
              comment: 'Agree.',
            },
            {
              uuid: 'c-2',
              is_per_offering: false,
              contributor_uuid: null,
              contributor_full_name: 'Contributor 2',
              comment: 'Disagree.',
            },
          ],
        },
      ]),
    );

    renderWithProviders(
      <StepInputsSection
        proposal={proposal}
        steps={[
          {
            uuid: 'instance-panel',
            call_step_uuid: 'step-panel',
            step_name: 'Panel assessment',
            kind: 'assessment',
            status: 'active',
            input_step_uuids: ['step-blind'],
          } as any,
        ]}
        isApplicant={false}
      />,
    );

    const output = await screen.findByTestId('step-input');
    for (const label of [
      'Reviewer 1',
      'Reviewer 2',
      'Contributor 1',
      'Contributor 2',
    ]) {
      expect(within(output).getByText(label)).toBeInTheDocument();
    }
    expect(within(output).getByText('Disagree.')).toBeInTheDocument();
  });
});

describe('StepInputsSection errors', () => {
  it('says so when the read fails for another reason', async () => {
    vi.mocked(proposalProposalsStepInputsList).mockImplementation(
      () => Promise.reject({ response: { status: 500 } }) as any,
    );
    renderWithProviders(
      <StepInputsSection
        proposal={proposal}
        steps={[{ ...responseStep, kind: 'assessment' }]}
        isApplicant={false}
      />,
    );
    expect(
      await screen.findByText(
        'Unable to load what the earlier steps produced.',
      ),
    ).toBeInTheDocument();
  });
});

describe('ReleasedReportsSection', () => {
  it('shows the released report and offers the rest for release', async () => {
    vi.mocked(proposalProposalsReleasedReportsList).mockImplementation(() =>
      page([
        {
          call_step_uuid: 'step-final',
          step_name: 'Final feedback',
          released_at: '2026-10-02T10:00:00Z',
          released_by_name: null,
          text: 'Edited feedback.',
          contributions: [],
        },
      ]),
    );
    renderWithProviders(
      <ReleasedReportsSection
        proposal={proposal}
        releasable={[
          {
            uuid: 'instance-consolidated',
            call_step_uuid: 'step-consolidated',
            step_name: 'Consolidated report',
            released_at: null,
            can_release: true,
          } as any,
        ]}
      />,
    );
    const report = await screen.findByTestId('released-report');
    expect(within(report).getByText('Edited feedback.')).toBeInTheDocument();
    expect(screen.getByText('Not released')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Release to applicant/ }),
    ).toBeInTheDocument();
  });
});
