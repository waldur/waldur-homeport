import { screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { reviewerProfilesList } from 'waldur-js-client';

import { ReviewerPoolExpandableRow } from '@/proposals/update/reviewer-pool/ReviewerPoolExpandableRow';
import { renderWithProviders } from '@/test/harness';
import { mockListResponse } from '@/test/utils';

import { ReviewerExpandableRow } from './ReviewerExpandableRow';

const profile = {
  uuid: 'profile-1',
  orcid_id: null,
  biography: 'Theoretical physicist.',
  affiliations: [],
  expertise_set: [],
  publications: [],
  stats: { total_reviews_completed: 4 },
};

const store = () => configureStore()({ tables: {} });

describe('ReviewerExpandableRow', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows the empty state when no profile is visible', async () => {
    vi.mocked(reviewerProfilesList).mockResolvedValue(
      mockListResponse([]) as any,
    );
    const { queryClient } = renderWithProviders(
      <Provider store={store()}>
        <ReviewerExpandableRow row={{ user_uuid: 'user-1' } as any} />
      </Provider>,
    );
    expect(
      await screen.findByText('No reviewer profile found.'),
    ).toBeInTheDocument();
    // An undefined result would fail the query instead of settling it.
    const state = queryClient.getQueryState(['reviewerProfile', 'user-1']);
    expect(state?.status).toBe('success');
    expect(state?.data).toBeNull();
  });

  it('shows the profile when one is visible', async () => {
    vi.mocked(reviewerProfilesList).mockResolvedValue(
      mockListResponse([profile]) as any,
    );
    renderWithProviders(
      <Provider store={store()}>
        <ReviewerExpandableRow row={{ user_uuid: 'user-1' } as any} />
      </Provider>,
    );
    expect(await screen.findByText('Theoretical physicist.')).toBeVisible();
    expect(reviewerProfilesList).toHaveBeenCalledWith({
      query: { user_uuid: 'user-1' },
    });
  });
});

describe('ReviewerPoolExpandableRow', () => {
  beforeEach(() => vi.clearAllMocks());

  it("looks the profile up by the reviewer's user, not the profile uuid", async () => {
    vi.mocked(reviewerProfilesList).mockResolvedValue(
      mockListResponse([profile]) as any,
    );
    renderWithProviders(
      <Provider store={store()}>
        <ReviewerPoolExpandableRow
          row={
            {
              uuid: 'pool-1',
              call_uuid: 'call-1',
              reviewer_uuid: 'profile-1',
              reviewer_user_uuid: 'user-1',
            } as any
          }
          call={{ uuid: 'call-1', customer_uuid: 'customer-1' } as any}
        />
      </Provider>,
    );
    expect(await screen.findByText('Theoretical physicist.')).toBeVisible();
    await waitFor(() =>
      expect(reviewerProfilesList).toHaveBeenCalledWith({
        query: { user_uuid: 'user-1' },
      }),
    );
  });
});
