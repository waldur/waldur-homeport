import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { chatThreadsStatsRetrieve } from 'waldur-js-client';

import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';

import { SupportAIAssistantLogsList } from './SupportAIAssistantLogsList';

// Only the stat row above the table is under test, so the table machinery and
// its redux-backed filter values are stubbed out. Both stubs are spies so a
// test can vary the active scope and assert what reaches the stats endpoint.
vi.mock('@/table/useTable', () => ({
  useTable: vi.fn(() => ({
    rows: [],
    fetch: vi.fn(),
    query: '',
    filtersStorage: [],
  })),
}));

// Table's props are captured so a test can trigger the refresh handler the
// toolbar button is wired to.
let tableRenderProps: any;
vi.mock('@/table/Table', () => ({
  default: (props: any) => {
    tableRenderProps = props;
    return null;
  },
}));
vi.mock('@/table/useFilterValues', () => ({
  useFilterValues: vi.fn(() => ({})),
}));

const tableFetch = vi.fn();

// Kept accessible so a test can inspect cache state the list is expected to
// invalidate on refresh.
let queryClient: QueryClient;

const renderList = () => {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <SupportAIAssistantLogsList />
    </QueryClientProvider>,
  );
};

describe('SupportAIAssistantLogsList', () => {
  beforeEach(() => {
    // Nothing clears mocks globally, so call history would leak across tests
    // and make "was the server hit?" assertions pass on a previous test's calls.
    vi.clearAllMocks();
    // mockReturnValue persists across tests, so restore the neutral scope or a
    // later test inherits an earlier one's filter.
    vi.mocked(useFilterValues).mockReturnValue({} as any);
    vi.mocked(useTable).mockReturnValue({
      rows: [],
      fetch: tableFetch,
      query: '',
      filtersStorage: [],
    } as any);
    vi.mocked(chatThreadsStatsRetrieve).mockResolvedValue({
      data: {
        threads_total: 320,
        users_total: 2,
        input_tokens_total: 842193,
        output_tokens_total: 361402,
        satisfaction_rate: 0.75,
      },
    } as any);
  });

  it('reports reach, then how it went, then what it cost', async () => {
    renderList();
    await screen.findByText('320');

    // Satisfaction sits between the counts and the token spend: it is the one
    // tile that says whether the traffic was any good, and reading it last left
    // it stranded behind two figures nobody scans for quality.
    expect(
      screen.getAllByRole('heading', { level: 1 }).map((h) => h.textContent),
    ).toEqual(['320', '2', '75%', '842,193', '361,402']);
  });

  it('scopes the summary to the active filter', async () => {
    // is_flagged rather than a date: its shape is unaffected by the date
    // control changing from two fields to a range picker.
    vi.mocked(useFilterValues).mockReturnValue({ is_flagged: true } as any);

    renderList();
    await screen.findByText('320');

    expect(vi.mocked(chatThreadsStatsRetrieve)).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({ is_flagged: true }),
      }),
    );
  });

  it('scopes the summary to the search term too', async () => {
    // useTable threads `query` separately from `filter`, so a summary built
    // from `filter` alone keeps showing all-time numbers the moment someone
    // searches — contradicting the rows underneath it.
    vi.mocked(useTable).mockReturnValue({
      rows: [],
      fetch: vi.fn(),
      query: 'quota',
      filtersStorage: [],
    } as any);

    renderList();
    await screen.findByText('320');

    expect(vi.mocked(chatThreadsStatsRetrieve)).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({ query: 'quota' }),
      }),
    );
  });

  it('refresh reaches expanded transcripts, not just the list and the stats', async () => {
    renderList();
    // Let the initial stats fetch settle first — refetching a query that is
    // still in flight is deduped, which would hide a missing refetch call.
    await waitFor(() =>
      expect(chatThreadsStatsRetrieve).toHaveBeenCalledTimes(1),
    );

    // Stands in for a row the user has expanded. The transcript key carries
    // `modified`, but submitting feedback saves the message with an explicit
    // update_fields list that never touches the thread — so the key does not
    // change and an open row keeps showing the feedback it held on expand.
    queryClient.setQueryData(['chatMessages', 'thread-A', '2026-08-10'], []);

    // The toolbar's refresh button calls the fetch handed to Table, which is
    // the list's — not useTable's raw one.
    act(() => {
      tableRenderProps.fetch();
    });

    expect(tableFetch).toHaveBeenCalled();
    await waitFor(() =>
      expect(chatThreadsStatsRetrieve).toHaveBeenCalledTimes(2),
    );
    await waitFor(() =>
      expect(
        queryClient.getQueryState(['chatMessages', 'thread-A', '2026-08-10'])
          ?.isInvalidated,
      ).toBe(true),
    );
  });
});
