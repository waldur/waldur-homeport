import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  proposalMyTasksSummaryRetrieve,
  proposalProposalsCount,
  proposalProposalsList,
} from 'waldur-js-client';

import { LinkProvider } from 'waldur-ui';

import { formatDate } from '@/core/dateUtils';
import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { MyCallWorkSummary } from './MyCallWorkSummary';

let store: ReturnType<ReturnType<typeof configureStore>>;

const renderSummary = (ui: ReactNode) =>
  renderWithProviders(<>{ui}</>, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <Provider store={store}>
        {/* Draws each card's link with its destination on it, to check. */}
        <LinkProvider
          renderLink={(to, params) => (
            // A renderer returns its link empty; StatCard fills it in.
            // eslint-disable-next-line jsx-a11y/anchor-has-content
            <a
              href={`/app/${to}`}
              data-to={to}
              data-params={JSON.stringify(params ?? {})}
            />
          )}
        >
          {children}
        </LinkProvider>
      </Provider>
    ),
  });

const counted = (count: number) =>
  ({
    response: { headers: new Headers({ 'x-result-count': String(count) }) },
  }) as any;

const countsByState = (counts: Record<string, number>) =>
  vi
    .mocked(proposalProposalsCount)
    .mockImplementation(((options: any) =>
      Promise.resolve(
        counted(counts[options.query.state.join(',')] ?? 0),
      )) as any);

describe('MyCallWorkSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store = configureStore()({ tables: {} });
    vi.mocked(useUser).mockReturnValue({ uuid: 'u1' } as any);
    vi.mocked(proposalMyTasksSummaryRetrieve).mockResolvedValue({
      data: { total: 0, overdue: 0, due_soon: 0, due_soon_days: 7 },
    } as any);
    vi.mocked(proposalProposalsList).mockResolvedValue({ data: [] } as any);
  });

  it('counts the applicant’s own proposals, asking as the applicant', async () => {
    countsByState({ draft: 2, 'submitted,in_review': 3, accepted: 1 });
    renderSummary(<MyCallWorkSummary />);

    expect(await screen.findByText('In draft')).toBeInTheDocument();
    expect(screen.getByText('In review')).toBeInTheDocument();
    expect(screen.getByText('Awarded')).toBeInTheDocument();
    for (const [options] of vi.mocked(proposalProposalsCount).mock.calls) {
      expect((options as any).query.as_role).toBe('applicant');
    }
  });

  it('leaves out what there is none of, and shows the fallback when there is nothing', async () => {
    countsByState({});
    renderSummary(<MyCallWorkSummary fallback="Nothing yet" />);

    expect(await screen.findByText('Nothing yet')).toBeInTheDocument();
    expect(proposalProposalsCount).toHaveBeenCalledTimes(3);
    expect(screen.queryByTestId('my-call-work')).not.toBeInTheDocument();
  });

  it('links a count to the list, filtered to what it counted', async () => {
    countsByState({ draft: 2 });
    renderSummary(<MyCallWorkSummary />);

    const link = await screen.findByRole('link', { name: /In draft/ });
    expect(link).toHaveAttribute('data-to', 'proposals-all-proposals');
    const { state } = JSON.parse(link.getAttribute('data-params'));
    expect(JSON.parse(state)).toEqual([
      expect.objectContaining({ value: 'draft' }),
    ]);
  });

  it('names the draft whose open round closes first', async () => {
    countsByState({ draft: 2 });
    const later = new Date(Date.now() + 30 * 86_400_000).toISOString();
    const past = new Date(Date.now() - 86_400_000).toISOString();
    vi.mocked(proposalProposalsList).mockResolvedValue({
      data: [
        {
          uuid: 'p1',
          name: 'Closed already',
          call_name: 'Regular Access',
          round: { cutoff_time: past },
        },
        {
          uuid: 'p2',
          name: 'Lattice QCD',
          call_name: 'Extreme Scale',
          round: { cutoff_time: later },
        },
      ],
    } as any);
    renderSummary(<MyCallWorkSummary />);

    // The card shows the date; which draft and call is in the label's help.
    expect(await screen.findByText(formatDate(later))).toBeInTheDocument();
    expect(screen.queryByText('Closed already')).not.toBeInTheDocument();
    await userEvent.hover(screen.getByRole('button', { name: 'Help' }));
    expect(
      (await screen.findAllByText(/^Lattice QCD in Extreme Scale closes/))
        .length,
    ).toBeGreaterThan(0);

    const link = screen.getByRole('link', { name: /Next draft deadline/ });
    expect(link).toHaveAttribute('data-to', 'proposals.manage-proposal');
    expect(JSON.parse(link.getAttribute('data-params'))).toEqual({
      proposal_uuid: 'p2',
    });
  });
});
