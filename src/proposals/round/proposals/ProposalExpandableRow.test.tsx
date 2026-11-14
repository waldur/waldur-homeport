import { screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalProposalsChecklistRetrieve } from 'waldur-js-client';

import { setTableQueryRows } from '@/table/mockTableQuery';
import { renderWithProviders } from '@/test/harness';

import { ProposalExpandableRow } from './ProposalExpandableRow';

// Serves the rows setTableQueryRows sets; no request fires.
vi.mock(
  'waldur-table/src/useTableQuery',
  () => import('@/table/mockTableQuery'),
);

vi.mock('@/proposals/proposal/create-review/RateStars', () => ({
  RateStars: ({ value }) => <span>{`stars: ${value}`}</span>,
}));

vi.mock('@/proposals/manage/ProposalStepCell', () => ({
  useProposalStepOwner: () => null,
}));

vi.mock('./ProposalReviewsRowActions', () => ({
  ProposalReviewsRowActions: () => null,
}));

const reviews = [
  { uuid: 'r1', state: 'submitted', summary_score: 4, reviewer_full_name: 'A' },
  { uuid: 'r2', state: 'in_review', summary_score: 3, reviewer_full_name: 'B' },
  { uuid: 'r3', state: 'rejected', summary_score: 0, reviewer_full_name: 'C' },
];

describe('ProposalExpandableRow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setTableQueryRows(reviews);
    vi.mocked(proposalProposalsChecklistRetrieve).mockRejectedValue(
      new Error('No checklist'),
    );
  });

  // A draft score, or the default 0 of a declined review, must not read as a
  // final rating to the call manager.
  it('shows star scores only for submitted reviews', async () => {
    const store = configureStore()({
      tables: {
        'ProposalReviewsListproposal-uuid': {
          loading: false,
          pagination: { pageSize: 5, resultCount: 3, currentPage: 1 },
          toggled: {},
          activeColumns: {},
          columnPositions: [],
        },
      },
      workspace: { user: {} },
    });
    renderWithProviders(
      <Provider store={store}>
        <ProposalExpandableRow
          row={
            {
              uuid: 'proposal-uuid',
              call_uuid: 'call-uuid',
              status_labels: [],
            } as any
          }
        />
      </Provider>,
    );

    expect(await screen.findByText('stars: 4')).toBeInTheDocument();
    expect(screen.getAllByText(/^stars:/)).toHaveLength(1);
    expect(screen.queryByText('stars: 3')).not.toBeInTheDocument();
    expect(screen.queryByText('stars: 0')).not.toBeInTheDocument();
  });
});
