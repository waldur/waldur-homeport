import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AsyncSearchBox } from './AsyncSearchBox';

// AsyncSearchBox infers its generic Fetcher type from `fetcher` — a plain
// vi.fn() mock has no SDK-shaped signature to infer from, so the whole
// component is cast loosely here rather than fighting that inference in
// a test that only cares about the panel's open/type behaviour.
const AnyAsyncSearchBox = AsyncSearchBox as any;

/**
 * Regression coverage for the Radix conversion: the search results panel
 * used to be a Metronic data-kt-menu dropdown, always mounted (hidden via
 * CSS) with an IntersectionObserver-based lazy-fetch. It's a Radix
 * Popover now, only mounted once open. The one behaviour worth pinning
 * down is that a Popover (not a DropdownMenu) is the right choice here:
 * typing a full word into the search input must not lose keystrokes to
 * menu-item typeahead, the same adversarial check
 * ActionsPopoverComponent's own fix used earlier in this migration.
 */
describe('AsyncSearchBox', () => {
  const RowComponent = ({ row }: { row: { uuid: string; name: string } }) => (
    <div>{row.name}</div>
  );

  const renderSearchBox = () => {
    const queryClient = new QueryClient();
    // Shape matches what processApiResponse (waldur-api-client) actually
    // reads: `result.data` as the raw row array (no parser is passed, so
    // it's cast directly), plus a real fetch-like `response.headers` for
    // content-type/x-result-count/link. The two tests below that don't
    // assert on rendered results never exercised this path — only the
    // new "fetches and renders" test does, which is what surfaced this
    // mock had the wrong shape (a `{ results, page_count }` envelope,
    // not what the real SDK client returns).
    const fetcher = vi.fn().mockResolvedValue({
      data: [{ uuid: '1', name: 'Alpha' }],
      response: {
        headers: new Headers({
          'content-type': 'application/json',
          'x-result-count': '1',
        }),
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AnyAsyncSearchBox
          fetcher={fetcher}
          queryKey="AsyncSearchBoxRegressionTest"
          queryField="query"
          RowComponent={RowComponent}
        />
      </QueryClientProvider>,
    );
    return { fetcher };
  };

  it('opens the results panel on focus without throwing', () => {
    expect(() => renderSearchBox()).not.toThrow();
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('the search input accepts a full word', async () => {
    const user = userEvent.setup();
    renderSearchBox();

    const input = screen.getByPlaceholderText('Search...');
    await user.click(input);
    await user.type(input, 'alpha');
    expect(input).toHaveValue('alpha');
  });

  /**
   * Regression coverage for a real bug this component's own conversion
   * introduced: the query's `enabled` flag was only ever flipped true
   * inside the Popover's `onOpenChange` — a callback Radix fires only for
   * changes *it* initiates (Trigger clicks, Escape, outside-click). This
   * component opens via `Popover.Anchor`, which has no such interaction
   * of its own — the input's onFocus/onChange call `setOpen(true)`
   * directly, so `onOpenChange` (and therefore `enabled`) never fired.
   * The query stayed permanently disabled, which React Query v5 reports
   * as `status: 'pending'` (v5 dropped `idle`) — rendered identically to
   * a real in-flight request, so the panel showed "Loading" forever with
   * no request ever sent. Reported live on the marketplace dashboard's
   * search box. Neither test above would have caught this: opening
   * without throwing and accepting typed input both hold regardless of
   * whether a request ever fires.
   */
  it('fetches and renders results once the panel opens', async () => {
    const user = userEvent.setup();
    const { fetcher } = renderSearchBox();

    const input = screen.getByPlaceholderText('Search...');
    await user.click(input);

    expect(fetcher).toHaveBeenCalled();
    expect(await screen.findByText('Alpha')).toBeInTheDocument();
  });
});
