import { screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  proposalProposalsChecklistRetrieve,
  proposalProposalsRetrieve,
  proposalPublicCallsRetrieve,
  proposalReviewsRetrieve,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { ProposalReviewCreatePage } from './ProposalReviewCreatePage';

// The navigation is what is under test: the sidebar is reduced to the entries
// the page hands it, and the sections other than compliance to nothing.
vi.mock('./CreatePageSidebar', () => ({
  CreatePageSidebar: ({ steps }) => (
    <ul aria-label="Progress">
      {steps.map((step) => (
        <li key={step.id}>{step.label}</li>
      ))}
    </ul>
  ),
}));
vi.mock('../ProposalRoleBasedTabs', () => ({
  ProposalRoleBasedTabs: () => null,
}));
vi.mock('./ReviewHeader', () => ({ ReviewHeader: () => null }));
vi.mock('./ConflictOfInterestNotice', () => ({
  ConflictOfInterestNotice: () => null,
}));
vi.mock('../create/ProposalDetailsOverviewStep', () => ({
  ProposalDetailsOverviewStep: () => null,
}));
vi.mock('./steps/FormProjectDetailsStep', () => ({
  FormProjectDetailsStep: () => null,
}));
vi.mock('../create/resource-requests-step/FormResourceRequestsStep', () => ({
  FormResourceRequestsStep: () => null,
}));
vi.mock('./steps/ReviewTeamStep', () => ({ ReviewTeamStep: () => null }));

const progress = () => screen.findByRole('list', { name: 'Progress' });

describe('ProposalReviewCreatePage compliance navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(proposalReviewsRetrieve).mockResolvedValue({
      data: {
        uuid: 'review-1',
        proposal_uuid: 'proposal-1',
        call_uuid: 'call-1',
      },
    } as any);
    vi.mocked(proposalProposalsRetrieve).mockResolvedValue({
      data: {
        uuid: 'proposal-1',
        call_uuid: 'call-1',
        compliance_status: { has_checklist: true },
      },
    } as any);
    vi.mocked(proposalPublicCallsRetrieve).mockResolvedValue({
      data: { uuid: 'call-1' },
    } as any);
  });

  it('lists the section while the answers load', async () => {
    vi.mocked(proposalProposalsChecklistRetrieve).mockReturnValue(
      new Promise(() => {}) as any,
    );

    renderWithProviders(<ProposalReviewCreatePage />);

    expect(
      within(await progress()).getByText('Compliance checklist'),
    ).toBeInTheDocument();
  });

  it('lists the section once the answers are in', async () => {
    vi.mocked(proposalProposalsChecklistRetrieve).mockResolvedValue({
      data: { questions: [] },
    } as any);

    renderWithProviders(<ProposalReviewCreatePage />);

    await waitFor(() =>
      expect(proposalProposalsChecklistRetrieve).toHaveBeenCalled(),
    );
    expect(
      within(await progress()).getByText('Compliance checklist'),
    ).toBeInTheDocument();
  });

  it('drops the section for a reviewer who is refused the answers', async () => {
    vi.mocked(proposalProposalsChecklistRetrieve).mockRejectedValue({
      response: { status: 403, data: { detail: 'Not allowed.' } },
    });

    renderWithProviders(<ProposalReviewCreatePage />);

    const nav = await progress();
    await waitFor(() =>
      expect(
        within(nav).queryByText('Compliance checklist'),
      ).not.toBeInTheDocument(),
    );
    expect(within(nav).getByText('Project team')).toBeInTheDocument();
  });
});
