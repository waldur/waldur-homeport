import { screen, waitFor, within } from '@testing-library/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  onTestFinished,
  vi,
} from 'vitest';
import {
  proposalProposalsContributionsList,
  proposalProposalsMyReviewerSuggestionsList,
  proposalProposalsReleasedReportsList,
  proposalProposalsStepChecklistRetrieve,
  proposalProposalsStepInputsList,
  proposalProposalsSuggestedReviewersList,
} from 'waldur-js-client';

import { ENV } from '@/core/config';
import { PermissionEnum } from '@/permissions/enums';
import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { ProposalDetails } from './ProposalDetails';

// The rail is what is under test: every section is reduced to nothing, and
// only the rules deciding whether it is on the page are kept.
const { stub } = vi.hoisted(() => ({
  stub: (names: string[]) =>
    Object.fromEntries(names.map((name) => [name, () => null])),
}));

vi.mock('./AllocationOutcomeSection', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./AllocationOutcomeSection')>()),
  ...stub(['AllocationOutcomeSection', 'AllocationStartBanner']),
}));
vi.mock('./StepChecklistSection', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./StepChecklistSection')>()),
  ...stub(['StepChecklistSection']),
}));
vi.mock('./contributions/StepContributionsSection', async (importOriginal) => ({
  ...(await importOriginal<
    typeof import('./contributions/StepContributionsSection')
  >()),
  ...stub(['StepContributionsSection']),
}));
vi.mock('./inputs/StepInputsSection', () => stub(['StepInputsSection']));
vi.mock('./inputs/ReleasedReportsSection', () =>
  stub(['ReleasedReportsSection']),
);
vi.mock('./evaluators/ProposalEvaluatorsSection', () =>
  stub(['ProposalEvaluatorsSection']),
);
vi.mock('./reviewer-suggestions/MyReviewerSuggestionsSection', () =>
  stub(['MyReviewerSuggestionsSection']),
);
vi.mock('./reviewer-suggestions/SuggestedReviewersSection', () =>
  stub(['SuggestedReviewersSection']),
);
vi.mock('./AwardedResourcesSection', () => stub(['AwardedResourcesSection']));
vi.mock('./AwardResponseActions', () => stub(['AwardResponseActions']));
vi.mock('./WorkflowStepActions', () => stub(['WorkflowStepActions']));
vi.mock('./create/ProposalDetailsOverviewStep', () =>
  stub(['ProposalDetailsOverviewStep']),
);
vi.mock('./create/ProjectDetailsSummary', () =>
  stub(['ProjectDetailsSummary']),
);
vi.mock('./create/ResourceRequestsSummary', () =>
  stub(['ResourceRequestsSummary']),
);
vi.mock('./create/ComplianceSummary', () => ({
  ComplianceSummary: () => null,
  useShowsComplianceSection: () => false,
}));
vi.mock('./create/utils', () => ({
  CreateManualAssignmentDialog: () => null,
  useCanCreateReview: () => false,
}));
vi.mock('../team/ProposalUsersListSummary', () =>
  stub(['ProposalUsersListSummary']),
);
vi.mock('../team/teamApi', () => ({ useProposalTeamReadable: () => true }));
vi.mock('@/proposals/ProposalCostTotal', () => stub(['ProposalCostTotal']));
vi.mock('@/proposals/useProposalResourceRows', () => ({
  useProposalResourceRows: () => ({ data: [] }),
}));
vi.mock('@/proposals/callQueries', () => ({
  useCallFixedDuration: () => null,
}));
vi.mock('@/proposals/awardedResources', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/proposals/awardedResources')>()),
  useAwardedResources: () => ({ data: undefined }),
}));

const RAPPORTEUR_ROLE = 'role-rapporteur';

// The rapporteurs' questions are running: the rapporteurs contribute their
// questions and suggest reviewers, and the call manager completes the step.
const workflowStates = [
  {
    uuid: 'state-assign',
    step: 'assign_rapporteurs',
    step_name: 'Assign rapporteurs',
    call_step_uuid: 'step-assign',
    kind: 'assignment',
    status: 'completed',
  },
  {
    uuid: 'state-questions',
    step: 'rapporteur_questions',
    step_name: "Rapporteurs' questions",
    call_step_uuid: 'step-questions',
    kind: 'assessment',
    status: 'active',
    completer: 'call_manager',
    contributor_proposal_role_uuid: RAPPORTEUR_ROLE,
    collects_reviewer_suggestions: true,
    can_suggest_reviewers: true,
    checklist_status: {
      has_checklist: true,
      checklist_name: 'Questions to the applicant',
    },
  },
  {
    uuid: 'state-review',
    step: 'scientific_review',
    step_name: 'Scientific review',
    call_step_uuid: 'step-review',
    kind: 'assessment',
    status: 'pending',
  },
];

vi.mock('../workflow/queries', () => ({
  fetchProposalWorkflowStates: () => Promise.resolve(workflowStates),
  proposalWorkflowStatesKey: (uuid: string) => ['ProposalWorkflowStates', uuid],
}));

let myRoles: { role_uuid: string; awaits_coi_confirmation: boolean }[] = [];
// The call's steps; undefined while unknown, when every role is listed.
let callSteps: any[] | undefined;
vi.mock('../proposal-roles/queries', () => ({
  useCallProposalRoles: (_call: string, enabled: boolean) => ({
    data: enabled ? [{ uuid: RAPPORTEUR_ROLE, name: 'Rapporteur' }] : undefined,
  }),
  useMyProposalRoleAssignments: (_proposal: string, userUuid?: string) => ({
    data: userUuid ? myRoles : undefined,
  }),
  useCallStepsNamingRoles: () => ({ data: callSteps }),
}));

// Named in the rail with the label the mock FormSteps renders.
vi.mock('@/wizard', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/wizard')>()),
  FormSteps: ({ steps }) => (
    <ul aria-label="On this page">
      {steps.map((step) => (
        <li key={step.id}>
          <a href={`#${step.id}`}>{step.label}</a>
        </li>
      ))}
    </ul>
  ),
}));

const proposal = {
  uuid: 'proposal-1',
  call_uuid: 'call-1',
  call_managing_organisation_uuid: 'organiser-1',
  created_by_uuid: 'applicant',
  compliance_status: null,
} as any;

const refused = { response: { status: 403, data: { detail: 'No.' } } };

const contribution = (uuid: string, contributor: string) => ({
  uuid,
  call_step_uuid: 'step-questions',
  status: 'accepted',
  contributor_full_name: contributor,
});

const rail = () => screen.getByRole('list', { name: 'On this page' });

const railEntries = () =>
  within(rail())
    .getAllByRole('link')
    .map((link) => [link.textContent, link.getAttribute('href')]);

const renderAs = (
  user,
  route = 'call-management.proposal-details',
  shown = proposal,
) => {
  vi.mocked(useUser).mockReturnValue(user);
  vi.mocked(useCurrentStateAndParams).mockReturnValue({
    state: { name: route },
    params: {},
  } as any);
  return renderWithProviders(
    <ProposalDetails proposal={shown} refetch={vi.fn()} />,
  );
};

/** With call management on, as the views of a proposal need it. */
const withCallManagement = () => {
  const features = ENV.FEATURES;
  ENV.FEATURES = {
    ...(features ?? {}),
    marketplace: {
      ...(features?.marketplace ?? {}),
      show_call_management_functionality: true,
    },
  } as any;
  return () => {
    ENV.FEATURES = features;
  };
};

let originalRoles: typeof ENV.roles;

describe('ProposalDetails section rail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    myRoles = [];
    originalRoles = ENV.roles;
    ENV.roles = [
      {
        name: 'CALL.MANAGER',
        permissions: [
          PermissionEnum.UPDATE_CALL,
          PermissionEnum.APPROVE_AND_REJECT_PROPOSALS,
        ],
      },
    ] as typeof ENV.roles;
    vi.mocked(proposalProposalsReleasedReportsList).mockResolvedValue({
      data: [],
    } as any);
    vi.mocked(proposalProposalsStepInputsList).mockRejectedValue(refused);
    vi.mocked(proposalProposalsStepChecklistRetrieve).mockResolvedValue({
      data: { questions: [{ uuid: 'q-1' }] },
    } as any);
    vi.mocked(proposalProposalsMyReviewerSuggestionsList).mockResolvedValue({
      data: [],
    } as any);
    vi.mocked(proposalProposalsSuggestedReviewersList).mockResolvedValue({
      data: [{ key: 'reviewer-1' }],
    } as any);
  });

  afterEach(() => {
    ENV.roles = originalRoles;
  });

  it('lists every section the call manager has, in page order', async () => {
    vi.mocked(proposalProposalsContributionsList).mockResolvedValue({
      data: [contribution('c-1', 'Ada'), contribution('c-2', 'Grace')],
    } as any);

    renderAs({
      uuid: 'manager',
      permissions: [
        { role_name: 'CALL.MANAGER', scope_type: 'call', scope_uuid: 'call-1' },
      ],
    });

    await waitFor(() =>
      expect(railEntries()).toEqual([
        // The step's actions, first: they are what the manager is here for.
        ['Current step', '#step-current-actions'],
        ['Details overview', '#step-general'],
        ['Project details', '#step-project'],
        ['Resource requests', '#step-resource-requests'],
        ['Questions to the applicant', '#step-checklist'],
        [
          "Rapporteurs' questions: contributions",
          '#step-contributions-step-questions',
        ],
        ['Evaluators', '#step-evaluators'],
        ['Reviewers suggested by the evaluators', '#step-suggested-reviewers'],
        ['Project team', '#step-team'],
        ['Activity', '#step-activity'],
      ]),
    );
    // The rail names where the reader is, not how far the workflow got.
    expect(screen.getByText('On this page')).toBeInTheDocument();
    expect(screen.queryByText('Progress')).not.toBeInTheDocument();
  });

  it('leaves out the evaluators when no enabled step needs the role', async () => {
    onTestFinished(() => {
      callSteps = undefined;
    });
    callSteps = [
      { is_enabled: true, assigns_roles: [] },
      { is_enabled: false, assigns_roles: [RAPPORTEUR_ROLE] },
    ];
    renderAs({
      uuid: 'manager',
      permissions: [
        { role_name: 'CALL.MANAGER', scope_type: 'call', scope_uuid: 'call-1' },
      ],
    });
    await waitFor(() =>
      expect(railEntries().map(([label]) => label)).toContain(
        'Details overview',
      ),
    );
    expect(railEntries().map(([label]) => label)).not.toContain('Evaluators');
  });

  it('lists only the applicant sections for the applicant', async () => {
    vi.mocked(proposalProposalsContributionsList).mockResolvedValue({
      data: [],
    } as any);
    vi.mocked(proposalProposalsReleasedReportsList).mockResolvedValue({
      data: [{ uuid: 'report-1' }],
    } as any);
    vi.mocked(proposalProposalsSuggestedReviewersList).mockRejectedValue(
      refused,
    );

    renderAs({ uuid: 'applicant', permissions: [] }, 'proposals.proposal');

    await waitFor(() =>
      expect(railEntries()).toEqual([
        ['Details overview', '#step-general'],
        ['Project details', '#step-project'],
        ['Resource requests', '#step-resource-requests'],
        ['Feedback to the applicant', '#step-released-reports'],
        ['Project team', '#step-team'],
        ['Activity', '#step-activity'],
      ]),
    );
    // Neither the evaluators' sections nor their reads.
    expect(proposalProposalsSuggestedReviewersList).not.toHaveBeenCalled();
    expect(proposalProposalsMyReviewerSuggestionsList).not.toHaveBeenCalled();
    expect(proposalProposalsStepChecklistRetrieve).not.toHaveBeenCalled();
  });

  it('lists a rapporteur their own work and suggestions, not every suggestion', async () => {
    myRoles = [{ role_uuid: RAPPORTEUR_ROLE, awaits_coi_confirmation: false }];
    vi.mocked(proposalProposalsContributionsList).mockResolvedValue({
      data: [contribution('c-1', 'Ada')],
    } as any);
    // The step's own checklist is the completer's; the rapporteur fills
    // theirs on their contribution card. The backend says they may not read
    // it, and it is not asked for.
    const status = (workflowStates[1] as any).checklist_status;
    status.can_read = false;

    renderAs({ uuid: 'rapporteur', permissions: [] }, 'proposals.proposal');

    await waitFor(() =>
      expect(railEntries()).toEqual([
        ['Details overview', '#step-general'],
        ['Project details', '#step-project'],
        ['Resource requests', '#step-resource-requests'],
        [
          "Rapporteurs' questions: contributions",
          '#step-contributions-step-questions',
        ],
        ['Evaluators', '#step-evaluators'],
        ['Suggested reviewers', '#step-my-reviewer-suggestions'],
        ['Project team', '#step-team'],
        ['Activity', '#step-activity'],
      ]),
    );
    expect(proposalProposalsSuggestedReviewersList).not.toHaveBeenCalled();
    expect(proposalProposalsStepChecklistRetrieve).not.toHaveBeenCalled();
    delete status.can_read;
  });

  it('keeps a rapporteur on an offering team at work on the plain page', async () => {
    const restore = withCallManagement();
    myRoles = [{ role_uuid: RAPPORTEUR_ROLE, awaits_coi_confirmation: false }];
    vi.mocked(proposalProposalsContributionsList).mockResolvedValue({
      data: [contribution('c-1', 'Ada')],
    } as any);
    vi.mocked(proposalProposalsStepChecklistRetrieve).mockRejectedValue(
      refused,
    );

    renderAs({ uuid: 'rapporteur', permissions: [] }, 'proposals.proposal', {
      ...proposal,
      offering_team_providers: [{ uuid: 'south', name: 'South' }],
    });

    await waitFor(() =>
      expect(railEntries()).toContainEqual([
        "Rapporteurs' questions: contributions",
        '#step-contributions-step-questions',
      ]),
    );
    expect(
      screen.queryByTestId('applicant-preview-notice'),
    ).not.toBeInTheDocument();
    restore();
  });

  it('shows an offering team the applicant view as a preview, without its work', async () => {
    const restore = withCallManagement();
    vi.mocked(proposalProposalsContributionsList).mockResolvedValue({
      data: [contribution('c-1', 'Ada')],
    } as any);

    renderAs(
      { uuid: 'provider', permissions: [] },
      'proposals.manage-proposal',
      {
        ...proposal,
        offering_team_providers: [{ uuid: 'south', name: 'South' }],
      },
    );

    expect(
      await screen.findByTestId('applicant-preview-notice'),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(railEntries()).toContainEqual(['Activity', '#step-activity']),
    );
    expect(railEntries().map(([label]) => label)).not.toContain(
      "Rapporteurs' questions: contributions",
    );
    restore();
  });

  it('leaves out a section that has nothing to show', async () => {
    vi.mocked(proposalProposalsContributionsList).mockResolvedValue({
      data: [],
    } as any);
    vi.mocked(proposalProposalsSuggestedReviewersList).mockRejectedValue(
      refused,
    );
    vi.mocked(proposalProposalsStepChecklistRetrieve).mockResolvedValue({
      data: { questions: [] },
    } as any);

    renderAs({
      uuid: 'manager',
      permissions: [
        { role_name: 'CALL.MANAGER', scope_type: 'call', scope_uuid: 'call-1' },
      ],
    });

    await waitFor(() =>
      expect(proposalProposalsSuggestedReviewersList).toHaveBeenCalled(),
    );
    await waitFor(() =>
      expect(railEntries().map(([label]) => label)).toEqual([
        'Current step',
        'Details overview',
        'Project details',
        'Resource requests',
        'Evaluators',
        'Project team',
        'Activity',
      ]),
    );
  });
});
