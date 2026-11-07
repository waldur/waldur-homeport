import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalProposalsChecklistRetrieve } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { ProposalDetails } from './ProposalDetails';

// The sections around the compliance one load data of their own and are
// covered by their own tests; here they only take up their place on the page.
vi.mock('./AllocationOutcomeSection', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./AllocationOutcomeSection')>()),
  AllocationOutcomeSection: () => null,
  AllocationStartBanner: () => null,
}));
vi.mock('./AwardedResourcesSection', () => ({
  AwardedResourcesSection: () => null,
}));
vi.mock('./AwardResponseActions', () => ({ AwardResponseActions: () => null }));
vi.mock('./create/ProjectDetailsSummary', () => ({
  ProjectDetailsSummary: () => null,
}));
vi.mock('./create/ProposalDetailsOverviewStep', () => ({
  ProposalDetailsOverviewStep: () => null,
}));
vi.mock('./create/ResourceRequestsSummary', () => ({
  ResourceRequestsSummary: () => null,
}));
vi.mock('./create/utils', () => ({
  CreateManualAssignmentDialog: () => null,
  useCanCreateReview: () => false,
}));
vi.mock('./StepChecklistSection', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./StepChecklistSection')>()),
  StepChecklistSection: () => null,
}));
vi.mock('./contributions/StepContributionsSection', async (importOriginal) => ({
  ...(await importOriginal<
    typeof import('./contributions/StepContributionsSection')
  >()),
  StepContributionsSection: () => null,
}));
vi.mock('./WorkflowStepActions', () => ({ WorkflowStepActions: () => null }));
// The team list renders its own card, which the open state reaches through
// `section`: kept, with nothing in it.
vi.mock('../team/ProposalUsersListSummary', async () => {
  const { AccordionCard } = await import('waldur-ui');
  return {
    ProposalUsersListSummary: ({ section }) =>
      section ? (
        <AccordionCard
          id={section.id}
          title={section.title}
          subtitle={section.subtitle}
          {...section.openProps}
        >
          {null}
        </AccordionCard>
      ) : null,
  };
});
vi.mock('@/proposals/ProposalCostTotal', () => ({
  ProposalCostTotal: () => null,
}));
vi.mock('@/proposals/useProposalResourceRows', () => ({
  useProposalResourceRows: () => ({ data: [] }),
}));
vi.mock('@/proposals/callQueries', () => ({
  useCallFixedDuration: () => null,
}));
vi.mock('../workflow/queries', () => ({
  fetchProposalWorkflowStates: () => Promise.resolve([]),
  proposalWorkflowStatesKey: (uuid: string) => ['ProposalWorkflowStates', uuid],
}));
vi.mock('@/proposals/awardedResources', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/proposals/awardedResources')>()),
  useAwardedResources: () => ({ data: undefined }),
}));
// The progress rail, reduced to the entries it is handed.
vi.mock('@/wizard', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/wizard')>()),
  FormSteps: ({ steps }) => (
    <ul aria-label="On this page">
      {steps.map((step) => (
        <li key={step.id}>{step.label}</li>
      ))}
    </ul>
  ),
}));

const proposal = {
  uuid: 'proposal-1',
  call_uuid: 'call-1',
  compliance_status: { has_checklist: true },
} as any;

const renderDetails = () =>
  renderWithProviders(
    <ProposalDetails proposal={proposal} refetch={vi.fn()} />,
  );

const progress = () => screen.getByRole('list', { name: 'On this page' });

const teamToggle = () => screen.getByRole('button', { name: /^Project team/ });

const complianceCard = () =>
  screen.queryByRole('button', { name: /^Compliance checklist/ });

describe('ProposalDetails compliance section', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists the section while the answers load, with the team folded', () => {
    vi.mocked(proposalProposalsChecklistRetrieve).mockReturnValue(
      new Promise(() => {}) as any,
    );

    renderDetails();

    expect(
      within(progress()).getByText('Compliance checklist'),
    ).toBeInTheDocument();
    expect(teamToggle()).toHaveAttribute('aria-expanded', 'false');
  });

  it('lists the section for a viewer who may read the answers', async () => {
    vi.mocked(proposalProposalsChecklistRetrieve).mockResolvedValue({
      data: { questions: [] },
    } as any);

    renderDetails();

    await waitFor(() =>
      expect(proposalProposalsChecklistRetrieve).toHaveBeenCalled(),
    );
    expect(
      within(progress()).getByText('Compliance checklist'),
    ).toBeInTheDocument();
    expect(complianceCard()).toBeInTheDocument();
    expect(teamToggle()).toHaveAttribute('aria-expanded', 'false');
  });

  it('drops the section for a viewer who is refused, the team staying folded', async () => {
    vi.mocked(proposalProposalsChecklistRetrieve).mockRejectedValue({
      response: { status: 403, data: { detail: 'Not allowed.' } },
    });

    renderDetails();

    await waitFor(() =>
      expect(
        within(progress()).queryByText('Compliance checklist'),
      ).not.toBeInTheDocument(),
    );
    expect(complianceCard()).not.toBeInTheDocument();
    // The team is reference: folded, whether or not compliance is shown.
    expect(teamToggle()).toHaveAttribute('aria-expanded', 'false');
  });

  // A request that is still pending, refused once the test says so.
  const pendingRefusal = () => {
    let refuse: () => void;
    const request = new Promise((_, reject) => {
      refuse = () =>
        reject({ response: { status: 403, data: { detail: 'Not allowed.' } } });
    });
    vi.mocked(proposalProposalsChecklistRetrieve).mockReturnValue(
      request as any,
    );
    return () => refuse();
  };

  it('keeps the team open when the viewer opened it before being refused', async () => {
    const refuse = pendingRefusal();

    renderDetails();
    await userEvent.click(teamToggle());
    expect(teamToggle()).toHaveAttribute('aria-expanded', 'true');

    refuse();
    await waitFor(() => expect(complianceCard()).not.toBeInTheDocument());
    expect(teamToggle()).toHaveAttribute('aria-expanded', 'true');
  });

  it('keeps the team folded when the viewer folded it before being refused', async () => {
    const refuse = pendingRefusal();

    renderDetails();
    await userEvent.click(teamToggle());
    await userEvent.click(teamToggle());
    expect(teamToggle()).toHaveAttribute('aria-expanded', 'false');

    refuse();
    await waitFor(() => expect(complianceCard()).not.toBeInTheDocument());
    expect(teamToggle()).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('ProposalDetails read as the applicant view', () => {
  it('says what the applicant was asked to change', () => {
    renderWithProviders(
      <ProposalDetails
        proposal={{
          ...proposal,
          state: 'in_review',
          open_change_requests: [
            {
              uuid: 'request-1',
              step_name: 'Administrative check',
              message: 'Please rename it.',
              unlocked_parts: ['field:name'],
              due_at: null,
              is_open: true,
            },
          ],
        }}
        refetch={vi.fn()}
      />,
    );
    expect(screen.getByTestId('change-request-notice')).toHaveTextContent(
      'Please rename it.',
    );
  });
});
