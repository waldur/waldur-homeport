import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  callReviewerPoolsList,
  myAssignmentBatchesList,
  proposalReviewsList,
  reviewerProfilesMeRetrieve,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { MyReviewsLayout } from './MyReviewsLayout';

const reviewer = {
  uuid: 'u1',
  full_name: 'Ada Reviewer',
  permissions: [{ scope_type: 'call', role_name: 'CALL.REVIEWER' }],
};

const countResponse = (count: number) =>
  ({
    data: [],
    response: { headers: new Headers({ 'x-result-count': String(count) }) },
  }) as any;

const renderLayout = () =>
  renderWithProviders(
    <MyReviewsLayout>
      <div data-testid="tab-table" />
    </MyReviewsLayout>,
  );

beforeEach(() => {
  vi.mocked(proposalReviewsList).mockResolvedValue(countResponse(2));
  vi.mocked(callReviewerPoolsList).mockResolvedValue(countResponse(1));
  vi.mocked(myAssignmentBatchesList).mockResolvedValue({ data: [] } as any);
  vi.mocked(reviewerProfilesMeRetrieve).mockReset();
});

describe('MyReviewsLayout', () => {
  it('shows a reviewer their profile and stats above the table', async () => {
    vi.mocked(useUser).mockReturnValue(reviewer as any);
    vi.mocked(reviewerProfilesMeRetrieve).mockResolvedValue({
      data: {
        is_published: true,
        stats: { total_reviews_completed: 3, average_review_time_days: 2 },
      },
    } as any);
    renderLayout();

    expect(await screen.findByTestId('tab-table')).toBeInTheDocument();
    expect(screen.getByText('Manage profile')).toBeInTheDocument();
    expect(screen.getByText('Avg. review time')).toBeInTheDocument();
    expect(reviewerProfilesMeRetrieve).toHaveBeenCalledTimes(1);
  });

  it('keeps the table for a reviewer without a profile, without stats', async () => {
    vi.mocked(useUser).mockReturnValue(reviewer as any);
    vi.mocked(reviewerProfilesMeRetrieve).mockRejectedValue({
      response: { status: 404 },
    });
    renderLayout();

    expect(await screen.findByTestId('tab-table')).toBeInTheDocument();
    expect(screen.getByText('Reviewer profile required')).toBeInTheDocument();
    expect(screen.queryByText('Avg. review time')).not.toBeInTheDocument();
  });

  it('prompts someone invited to review, who holds no role yet, to create a profile', async () => {
    // A pending reviewer pool invitation, no call role: accepting it needs
    // the profile the card asks for.
    vi.mocked(useUser).mockReturnValue({ uuid: 'u3', permissions: [] } as any);
    vi.mocked(proposalReviewsList).mockResolvedValue(countResponse(0));
    vi.mocked(callReviewerPoolsList).mockResolvedValue(countResponse(1));
    vi.mocked(reviewerProfilesMeRetrieve).mockRejectedValue({
      response: { status: 404 },
    });
    renderLayout();

    expect(
      await screen.findByText('Reviewer profile required'),
    ).toBeInTheDocument();
    expect(await screen.findByTestId('tab-table')).toBeInTheDocument();
  });

  it('shows anyone else the table alone', async () => {
    vi.mocked(useUser).mockReturnValue({ uuid: 'u2', permissions: [] } as any);
    vi.mocked(proposalReviewsList).mockResolvedValue(countResponse(0));
    vi.mocked(callReviewerPoolsList).mockResolvedValue(countResponse(0));
    renderLayout();

    expect(screen.getByTestId('tab-table')).toBeInTheDocument();
    await waitFor(() => expect(callReviewerPoolsList).toHaveBeenCalled());
    expect(screen.queryByText('Manage profile')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Reviewer profile required'),
    ).not.toBeInTheDocument();
    expect(reviewerProfilesMeRetrieve).not.toHaveBeenCalled();
  });
});
