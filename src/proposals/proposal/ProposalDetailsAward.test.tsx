import { screen, waitFor } from '@testing-library/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalProposalsAwardedResourcesList } from 'waldur-js-client';

import { awardedResourcesKey } from '@/proposals/awardedResources';
import { createTestQueryClient, renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { ProposalDetails } from './ProposalDetails';

vi.mock('../workflow/queries', () => ({
  proposalWorkflowStatesKey: (uuid: string) => ['proposalWorkflowStates', uuid],
  fetchProposalWorkflowStates: () =>
    Promise.resolve([
      {
        step: 'allocation_decision',
        status: 'completed',
        outcome: 'approved',
      },
    ]),
}));
vi.mock('@/proposals/useProposalResourceRows', () => ({
  useProposalResourceRows: () => ({ data: [] }),
}));
vi.mock('@/proposals/callQueries', () => ({
  useCallFixedDuration: () => undefined,
}));
vi.mock('./create/utils', () => ({
  useCanCreateReview: () => false,
  CreateManualAssignmentDialog: () => null,
}));
// The award as the rest of the page uses it: the section itself, the
// progress rail, the sidebar total and the outcome above.
vi.mock('./AwardedResourcesSection', () => ({
  AwardedResourcesSection: () => <div>Award section</div>,
}));
vi.mock('@/wizard', () => ({
  FormSteps: ({ steps }: { steps: { label: string }[] }) => (
    <ul>
      {steps.map((step) => (
        <li key={step.label}>{step.label}</li>
      ))}
    </ul>
  ),
}));
vi.mock('@/proposals/ProposalCostTotal', () => ({
  ProposalCostTotal: ({ title }: { title?: string }) => (
    <div>{title ?? 'Summary of the request'}</div>
  ),
}));
vi.mock('./AllocationOutcomeSection', () => ({
  AllocationStartBanner: () => null,
  AllocationOutcomeSection: ({ awardRows }: { awardRows?: unknown[] }) =>
    awardRows ? <div>Outcome with the award</div> : null,
}));
vi.mock('./create/ProposalDetailsOverviewStep', () => ({
  ProposalDetailsOverviewStep: () => null,
}));
vi.mock('./create/ProjectDetailsSummary', () => ({
  ProjectDetailsSummary: () => null,
}));
vi.mock('./create/ResourceRequestsSummary', () => ({
  ResourceRequestsSummary: () => null,
}));
vi.mock('./create/ComplianceSummary', () => ({
  ComplianceSummary: () => null,
  useShowsComplianceSection: () => false,
}));
vi.mock('../team/ProposalUsersListSummary', () => ({
  ProposalUsersListSummary: () => null,
}));
vi.mock('./StepChecklistSection', () => ({
  StepChecklistSection: () => null,
}));
vi.mock('./TechnicalAssessmentSection', () => ({
  TechnicalAssessmentSection: () => null,
}));
vi.mock('./WorkflowStepActions', () => ({
  WorkflowStepActions: () => null,
}));
vi.mock('./AwardResponseActions', () => ({
  AwardResponseActions: () => null,
}));

const proposal = {
  uuid: 'proposal-uuid',
  state: 'in_review',
  call_uuid: 'call-uuid',
  created_by_uuid: 'applicant-uuid',
  compliance_status: null,
  decision_held: true,
} as any;

const award = {
  uuid: 'award-uuid',
  requested_resource: 'request-uuid',
  requested_offering: { uuid: 'offering-uuid', components: [] },
  limits: {},
  attributes: {},
};

const renderDetails = (route: string) => {
  vi.mocked(useCurrentStateAndParams).mockReturnValue({
    state: { name: route },
    params: {},
  } as any);
  // What the Call manager tab already loaded in this session.
  const queryClient = createTestQueryClient();
  queryClient.setQueryData(awardedResourcesKey(proposal.uuid), [award]);
  return renderWithProviders(
    <ProposalDetails proposal={proposal} refetch={vi.fn()} />,
    { queryClient },
  );
};

describe('ProposalDetails award while the decision is held', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUser).mockReturnValue({
      uuid: 'manager-uuid',
      is_staff: true,
      permissions: [],
    } as any);
    vi.mocked(proposalProposalsAwardedResourcesList).mockResolvedValue({
      data: [award],
    } as any);
  });

  // The Applicant tab is the call team's preview of the applicant's page,
  // where a held decision is still being made and its award is not shown.
  it('keeps the award off the Applicant tab', async () => {
    renderDetails('proposals.manage-proposal');

    expect(await screen.findByText('Progress')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText('Summary of the request')).toBeInTheDocument(),
    );
    expect(screen.queryByText('Award section')).not.toBeInTheDocument();
    expect(screen.queryByText('Awarded resources')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Outcome with the award'),
    ).not.toBeInTheDocument();
    expect(proposalProposalsAwardedResourcesList).not.toHaveBeenCalled();
  });

  it('shows it on the Call manager tab', async () => {
    renderDetails('call-management.proposal-details');

    expect(await screen.findByText('Award section')).toBeInTheDocument();
    expect(screen.getByText('Awarded resources')).toBeInTheDocument();
    expect(screen.getByText('Summary of the award')).toBeInTheDocument();
  });
});
