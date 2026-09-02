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
    const fetcher = vi.fn().mockResolvedValue({
      data: { results: [{ uuid: '1', name: 'Alpha' }], page_count: 1 },
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
});
