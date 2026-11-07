import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalReviewsList } from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';
import { mockListResponse } from '@/test/utils';

import { ReviewerReviews } from './ReviewerReviews';
import { ReviewerReviewsDialog } from './ReviewerReviewsDialog';
import { ReviewerRowActions } from './ReviewerRowActions';

vi.mock('@/table/Table', () => ({
  default: ({ verboseName, rows, columns }) => (
    <div data-testid="table" aria-label={verboseName}>
      {(rows ?? []).map((row, index) => (
        <div key={index}>
          {columns.map((column, i) => (
            <span key={i}>{column.render({ row })}</span>
          ))}
        </div>
      ))}
    </div>
  ),
}));
// Fetches the first page through the real fetcher, as the table would.
vi.mock('@/table/useTable', async () => {
  const { useEffect, useState } = await import('react');
  return {
    useTable: ({ table, fetchData, filter }) => {
      const [rows, setRows] = useState([]);
      useEffect(() => {
        fetchData({
          tableKey: table,
          currentPage: 1,
          pageSize: 10,
          filter,
        }).then((result) => setRows(result.rows));
      }, [table, fetchData, filter]);
      return { rows };
    },
  };
});
vi.mock('@/core/Link', () => ({
  Link: ({ label }) => <a href="#proposal">{label}</a>,
}));

const call = {
  uuid: 'call-1',
  name: 'Quantum call',
  customer_uuid: 'customer-1',
} as any;

const row = (overrides = {}) =>
  ({
    uuid: 'pool-1',
    reviewer_uuid: 'profile-1',
    reviewer_user_uuid: 'user-1',
    reviewer_name: 'Marie Curie',
    invited_user: null,
    reviews_in_progress: 1,
    reviews_completed: 2,
    ...overrides,
  }) as any;

describe('ReviewerReviews', () => {
  beforeEach(() => vi.clearAllMocks());

  it('keeps a zero count as plain text', () => {
    renderWithProviders(
      <Provider store={configureStore()({ tables: {} })}>
        <ReviewerReviews
          row={row({ reviews_in_progress: 0, reviews_completed: 0 })}
          call={call}
        />
      </Provider>,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it("links the count to the call's reviews, filtered to the reviewer", () => {
    renderWithProviders(
      <Provider store={configureStore()({ tables: {} })}>
        <ReviewerReviews row={row()} call={call} />
      </Provider>,
    );
    expect(
      screen.getByRole('link', { name: '1 in progress, 2 completed' }),
    ).toBeInTheDocument();
  });
});

describe('ReviewerRowActions show reviews', () => {
  beforeEach(() => vi.clearAllMocks());

  it("opens the reviewer's reviews from the row's menu", async () => {
    const user = userEvent.setup();
    const poolRow = row();
    renderWithProviders(
      <ReviewerRowActions
        row={poolRow}
        call={call}
        refetch={vi.fn()}
        canManage={false}
      />,
    );
    await user.click(screen.getByRole('button'));
    await user.click(
      await screen.findByRole('menuitem', { name: 'Show reviews' }),
    );
    expect(useModal().openDialog).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ resolve: { call, row: poolRow } }),
    );
  });
});

describe('ReviewerReviewsDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(proposalReviewsList).mockResolvedValue(
      mockListResponse([
        {
          uuid: 'review-1',
          proposal_uuid: 'proposal-1',
          proposal_name: 'Lattice QCD',
          state: 'submitted',
          summary_score: 4,
          review_end_date: null,
        },
      ]),
    );
  });

  it("lists the counted reviews of the reviewer's user in this call", async () => {
    renderWithProviders(
      <ReviewerReviewsDialog resolve={{ call, row: row() }} />,
    );

    expect(screen.getByText("Marie Curie's reviews")).toBeInTheDocument();
    expect(await screen.findByText('Lattice QCD')).toBeInTheDocument();
    expect(proposalReviewsList).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({
          call_uuid: 'call-1',
          reviewer_uuid: 'user-1',
          state: ['in_review', 'submitted'],
        }),
      }),
    );
  });

  it('lists nothing for a reviewer without an account', () => {
    renderWithProviders(
      <ReviewerReviewsDialog
        resolve={{
          call,
          row: row({ reviewer_uuid: null, reviewer_user_uuid: null }),
        }}
      />,
    );
    expect(
      screen.getByText('This reviewer has no account yet, so no reviews.'),
    ).toBeInTheDocument();
    expect(proposalReviewsList).not.toHaveBeenCalled();
  });
});
