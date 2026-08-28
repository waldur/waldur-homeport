import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  anonymousChatInteractionsConversationsList,
  anonymousChatInteractionsKpiRetrieve,
} from 'waldur-js-client';

import { AnonymousChatPanel } from './AnonymousChatPanel';

// Capture the options the panel hands to useTable so the client-side paginator
// can be driven directly, and the props it hands to Table so the custom refresh
// control (mounted via tableActions) can be triggered.
let tableOptions: any;
const tableFetch = vi.fn();
vi.mock('@/table/useTable', () => ({
  useTable: (options: any) => {
    tableOptions = options;
    return { rows: [], fetch: tableFetch };
  },
}));

let tableRenderProps: any;
vi.mock('@/table/Table', () => ({
  default: (props: any) => {
    tableRenderProps = props;
    return null;
  },
}));

// Filter values come from the redux table slice; the panel only forwards them.
vi.mock('@/table/useFilterValues', () => ({ useFilterValues: () => ({}) }));

// Kept accessible so a test can inspect cache state the panel is expected to
// invalidate on refresh.
let queryClient: QueryClient;

const renderPanel = () => {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AnonymousChatPanel />
    </QueryClientProvider>,
  );
};

const request = { tableKey: 't', currentPage: 1, pageSize: 10, filter: {} };

// Every stat lands in an h1, and the two widgets render in DOM order — visitor
// traffic first, the nightly judge second — so slicing pins each row without
// test-only markup.
const statValues = () =>
  screen.getAllByRole('heading', { level: 1 }).map((h) => h.textContent);

const kpiFixture = (overrides: Record<string, unknown> = {}) => ({
  interactions_total: 111,
  sessions_total: 24,
  unique_users: 1,
  flagged_total: 0,
  feedback_positive: 2,
  feedback_negative: 3,
  satisfaction_rate: 0.4,
  clicks_total: 9,
  click_through_rate: 0.08,
  clarification_requests_total: 13,
  clarification_rate: 0.12,
  input_tokens_total: 842193,
  output_tokens_total: 361402,
  reviewed_total: 0,
  review_input_tokens_total: 0,
  review_output_tokens_total: 0,
  ...overrides,
});

describe('AnonymousChatPanel', () => {
  beforeEach(() => {
    // Nothing clears mocks globally, so call history would leak across tests
    // and make "was the server hit?" assertions pass on a previous test's calls.
    vi.clearAllMocks();
    vi.mocked(anonymousChatInteractionsConversationsList).mockResolvedValue({
      data: [],
    } as any);
    vi.mocked(anonymousChatInteractionsKpiRetrieve).mockResolvedValue({
      data: undefined,
    } as any);
  });

  it('narrows on the server and pages what comes back in memory', async () => {
    const rows = Array.from({ length: 15 }, (_, i) => ({
      user_slug: `visitor-${i}`,
    }));
    vi.mocked(anonymousChatInteractionsConversationsList).mockResolvedValue({
      data: rows,
    } as any);

    renderPanel();

    const page1 = await tableOptions.fetchData({
      ...request,
      currentPage: 1,
      filter: { query: 'slurm', is_flagged: true, severity: 'high' },
    });

    // The search has to reach the server: it runs full-text over the
    // transcript, and the row payload carries no message text — matching
    // locally would only ever see the salted visitor hash.
    expect(anonymousChatInteractionsConversationsList).toHaveBeenLastCalledWith(
      {
        query: expect.objectContaining({
          query: 'slurm',
          is_flagged: true,
          severity: 'high',
        }),
      },
    );

    // The response is unpaginated, so the slicing stays local.
    expect(page1.resultCount).toBe(15);
    expect(page1.rows).toHaveLength(10);
    const page2 = await tableOptions.fetchData({ ...request, currentPage: 2 });
    expect(page2.rows).toHaveLength(5);

    // The refresh control stays the built-in one, which the toolbar renders
    // between the search box and the filter button. Mounting our own through
    // tableActions put it last in the row, after the column-settings gear.
    expect(tableRenderProps.hideRefresh).toBeFalsy();
    expect(tableRenderProps.tableActions).toBeUndefined();
  });

  it('offers the same filter drawer and column settings as the authenticated tab', () => {
    renderPanel();

    // The term is written to filter[queryField], which is the name the server
    // knows it by — a mismatch here silently searches nothing.
    expect(tableOptions.queryField).toBe('query');
    expect(tableOptions.syncFiltersToURL).toBe(true);
    expect(tableRenderProps.filters).toBeTruthy();
    expect(tableRenderProps.formId).toBe(
      'AnonymousChatInteractionsConversationsFilter',
    );
    expect(tableRenderProps.hasOptionalColumns).toBe(true);
    expect(tableRenderProps.enableExport).toBe(true);
  });

  it('makes every column sortable, and sorts across the whole result set', async () => {
    vi.mocked(anonymousChatInteractionsConversationsList).mockResolvedValue({
      data: [
        { user_slug: 'a', message_count: 2 },
        { user_slug: 'b', message_count: 9 },
        { user_slug: 'c', message_count: 5 },
      ],
    } as any);

    renderPanel();

    // A header only becomes a sort control once the column declares
    // orderField; without it the arrows never appear.
    const unsortable = tableRenderProps.columns
      .filter((column: any) => !column.orderField)
      .map((column: any) => column.id);
    expect(unsortable).toEqual([]);

    // The server discards `o` for this endpoint — session_aggregates re-orders
    // by -last_active after grouping — so the sort has to happen locally, and
    // over the full payload rather than the page on screen.
    const sorted = await tableOptions.fetchData({
      ...request,
      pageSize: 2,
      filter: { o: '-message_count' },
    });
    expect(sorted.rows.map((r: any) => r.message_count)).toEqual([9, 5]);
  });

  it('exports the visitor hash in full, not the truncated cell', () => {
    renderPanel();

    const slug =
      'd8d2fa31428f452c3b13e8594e9fbc1ec15767d3c2b537dc9741c3e00a11cf06';
    const visitor = tableRenderProps.columns.find(
      (column: any) => column.id === 'user_slug',
    );

    // The cell shows a 10-character prefix so the column stays narrow. An
    // export is for analysis elsewhere, where a truncated hash joins to
    // nothing — without an explicit handler the fallback would emit whatever
    // the first key holds, which is right here only by accident.
    expect(visitor.export({ user_slug: slug })).toBe(slug);
  });

  it('refresh reaches expanded transcripts, not just the list and the stats', async () => {
    renderPanel();
    // Let the initial stats fetch settle first — refetching a query that is
    // still in flight is deduped, which would hide a missing refetch call.
    await waitFor(() =>
      expect(anonymousChatInteractionsKpiRetrieve).toHaveBeenCalledTimes(1),
    );

    // Stands in for a row the user has expanded. The transcript is a separate
    // per-session query, so reloading the table leaves the feedback and click
    // counts inside the open row showing whatever they held on expand.
    queryClient.setQueryData(['anonymous-chat-transcript', 'session-A'], []);

    // The toolbar's refresh button calls the fetch handed to Table, which is
    // the panel's — not useTable's raw one.
    act(() => {
      tableRenderProps.fetch();
    });

    // All three surfaces, not just the one the button visibly belongs to.
    expect(tableFetch).toHaveBeenCalled();
    await waitFor(() =>
      expect(anonymousChatInteractionsKpiRetrieve).toHaveBeenCalledTimes(2),
    );
    await waitFor(() =>
      expect(
        queryClient.getQueryState(['anonymous-chat-transcript', 'session-A'])
          ?.isInvalidated,
      ).toBe(true),
    );
  });

  it('reports token spend as one combined tile, with the split behind the tooltip', async () => {
    vi.mocked(anonymousChatInteractionsKpiRetrieve).mockResolvedValue({
      data: kpiFixture(),
    } as any);

    renderPanel();

    // Combined, so the row stays at the five tiles SummaryWidget lays out
    // without wrapping. Asserting the sum also pins that both halves feed it —
    // rendering either one alone would show a different number.
    await screen.findByText('1,203,595');

    // Interactions gave way to the token tile. An anonymous session is one
    // conversation, which the authenticated tab calls a thread — same concept,
    // so the dashboard uses one word for it.
    expect(screen.queryByText('Interactions')).toBeNull();
    expect(screen.queryByText('Sessions')).toBeNull();
    expect(screen.getByText('Threads')).toBeTruthy();

    // Same sequence as the authenticated tab: reach, then whether it went well,
    // then what it cost. Satisfaction reads as an afterthought anywhere later.
    expect(statValues().slice(0, 6)).toEqual([
      '24',
      '1',
      '40%',
      '8%',
      '12%',
      '1,203,595',
    ]);

    const clarificationTip = screen
      .getByText('Clarification')
      // eslint-disable-next-line testing-library/no-node-access
      .querySelector('span');
    await userEvent.hover(clarificationTip!);
    await screen.findByText(
      'Interactions where the assistant asked a clarifying question instead of recommending — 13 of 111.',
    );

    // The split still has to be reachable, and in the right order. Tip renders
    // its trigger as a bare span with no role or name, so there is nothing to
    // query it by — reach it through the label that does have text.
    // eslint-disable-next-line testing-library/no-node-access
    const tokensTip = screen.getByText('Tokens').querySelector('span');
    await userEvent.hover(tokensTip!);
    await screen.findByText('842,193 input / 361,402 output');
  });

  it('reports the nightly judge in its own row, spend included', async () => {
    vi.mocked(anonymousChatInteractionsKpiRetrieve).mockResolvedValue({
      data: kpiFixture({
        sessions_total: 190,
        reviewed_total: 142,
        avg_llm_resolution_score: 3.75,
        hallucination_rate: 0.04,
        // Deliberately not in descending order — the top intent is the biggest
        // count, not whichever key the backend happened to emit first.
        llm_intent_distribution: { storage: 12, gpu_compute: 38 },
        review_input_tokens_total: 1_100_000,
        review_output_tokens_total: 100_000,
      }),
    } as any);

    renderPanel();
    // Review is per thread, so the tile is a plain count of reviewed threads
    // rather than a ratio against the thread total shown two tiles left.
    await screen.findByText('142');

    expect(statValues().slice(6)).toEqual([
      '142',
      '3.8 / 5',
      '4%',
      'gpu_compute',
      '1,200,000',
    ]);

    // Judge spend is reported next to what it bought, never folded into the
    // visitor Tokens tile at the end of row 1 — the two run on separate
    // budgets, and one merged number would hide the split that separation
    // exists to protect.
    expect(statValues()[5]).toBe('1,203,595');

    // eslint-disable-next-line testing-library/no-node-access
    const reviewTip = screen.getByText('Review tokens').querySelector('span');
    await userEvent.hover(reviewTip!);
    await screen.findByText('1,100,000 input / 100,000 output');
  });

  it('keeps the review row on screen when nothing has been judged', async () => {
    vi.mocked(anonymousChatInteractionsKpiRetrieve).mockResolvedValue({
      data: kpiFixture(),
    } as any);

    renderPanel();
    await screen.findByText('1,203,595');

    // The backend drops the rate fields entirely at zero coverage. Hiding the
    // row on that basis would make a dead nightly pass look like a healthy
    // dashboard — the counts stay, the rates read N/A.
    expect(statValues().slice(6)).toEqual(['0', 'N/A', 'N/A', 'N/A', '0']);
  });
});
