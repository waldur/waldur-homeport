import { screen, waitFor } from '@testing-library/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  proposalProposalsRetrieve,
  proposalPublicCallsRetrieve,
  proposalReviewsList,
} from 'waldur-js-client';

import { goToNotFound } from '@/error/utils';
import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { ProposalManagePage } from './ProposalManagePage';

vi.mock('@/error/utils', () => ({ goToNotFound: vi.fn() }));
vi.mock('@/navigation/context', () => ({ useBreadcrumbs: vi.fn() }));
vi.mock('@/navigation/title', () => ({ useTitle: vi.fn() }));
vi.mock('@/proposals/breadcrumbs', () => ({
  useProposalBreadcrumbItems: () => [],
  useParticipantProposalBreadcrumbItems: () => [],
  useProviderProposalBreadcrumbItems: () => [],
  useCallManagedProposalBreadcrumbItems: () => [],
}));
vi.mock('../ProposalRoleBasedTabs', () => ({
  ProposalRoleBasedTabs: () => null,
}));
vi.mock('../WorkflowTimeline', () => ({ WorkflowTimeline: () => null }));
vi.mock('../DownloadProposalPdfAction', () => ({
  DownloadProposalPdfAction: () => null,
}));
vi.mock('../ProposalDetails', () => ({
  ProposalDetails: () => <div>Proposal details</div>,
}));
vi.mock('./ProposalHeader', () => ({ ProposalHeader: () => null }));
vi.mock('./ProposalSubmissionStep', () => ({
  ProposalSubmissionStep: () => null,
}));

const REVIEWER = 'reviewer-uuid';
const REVIEW = 'review-uuid';

const review = (state: string) => ({
  uuid: REVIEW,
  reviewer_uuid: REVIEWER,
  proposal_uuid: 'proposal-uuid',
  state,
  modified: '2026-03-14T10:00:00Z',
});

const notFound = Object.assign(new Error('Not found'), {
  response: { status: 404 },
});

const setup = ({
  readable,
  reviews,
  viaReview = true,
}: {
  readable: boolean;
  reviews: any[];
  viaReview?: boolean;
}) => {
  vi.mocked(useCurrentStateAndParams).mockReturnValue({
    state: { name: 'proposals.manage-proposal' },
    params: viaReview
      ? { proposal_uuid: 'proposal-uuid', review_uuid: REVIEW }
      : { proposal_uuid: 'proposal-uuid' },
  } as any);
  vi.mocked(useUser).mockReturnValue({ uuid: REVIEWER } as any);
  vi.mocked(proposalProposalsRetrieve).mockImplementation((() =>
    readable
      ? Promise.resolve({
          data: { uuid: 'proposal-uuid', state: 'in_review' },
        })
      : Promise.reject(notFound)) as any);
  vi.mocked(proposalPublicCallsRetrieve).mockResolvedValue({
    data: {},
  } as any);
  vi.mocked(proposalReviewsList).mockResolvedValue({
    data: reviews,
    response: { headers: new Headers({ 'x-result-count': '1' }) },
  } as any);
  return renderWithProviders(<ProposalManagePage />);
};

describe('ProposalManagePage opened from a link to a review', () => {
  beforeEach(() => {
    vi.mocked(goToNotFound).mockClear();
  });

  it('tells a reviewer whose review was rejected why the proposal is gone', async () => {
    setup({ readable: false, reviews: [review('rejected')] });
    expect(
      await screen.findByText(/you no longer have access to this proposal/),
    ).toBeInTheDocument();
    expect(goToNotFound).not.toHaveBeenCalled();
  });

  it('notes the rejection above a proposal that is still readable', async () => {
    setup({ readable: true, reviews: [review('rejected')] });
    expect(await screen.findByText('Proposal details')).toBeInTheDocument();
    expect(
      screen.getByText(/^This review was rejected on .*\.$/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/no longer have access/)).not.toBeInTheDocument();
  });

  it('says nothing of a review still under way', async () => {
    setup({ readable: true, reviews: [review('in_review')] });
    expect(await screen.findByText('Proposal details')).toBeInTheDocument();
    expect(screen.queryByText(/was rejected/)).not.toBeInTheDocument();
  });

  it('falls back to "not found" when there is nothing to explain', async () => {
    setup({ readable: false, reviews: [] });
    await waitFor(() => expect(goToNotFound).toHaveBeenCalled());
    expect(screen.queryByText(/was rejected/)).not.toBeInTheDocument();
  });
});

describe('ProposalManagePage opened from the proposal’s own link', () => {
  beforeEach(() => {
    vi.mocked(goToNotFound).mockClear();
  });

  it('tells a reviewer whose review was rejected why it is gone', async () => {
    setup({
      readable: false,
      reviews: [review('rejected')],
      viaReview: false,
    });
    expect(
      await screen.findByText(/you no longer have access to this proposal/),
    ).toBeInTheDocument();
    expect(goToNotFound).not.toHaveBeenCalled();
  });

  it('is plainly not found for anyone else', async () => {
    setup({
      readable: false,
      reviews: [{ ...review('rejected'), reviewer_uuid: 'someone-else' }],
      viaReview: false,
    });
    await waitFor(() => expect(goToNotFound).toHaveBeenCalled());
  });

  it('says nothing of a rejection while the proposal opens', async () => {
    setup({ readable: true, reviews: [review('rejected')], viaReview: false });
    expect(await screen.findByText('Proposal details')).toBeInTheDocument();
    expect(screen.queryByText(/was rejected/)).not.toBeInTheDocument();
  });
});
