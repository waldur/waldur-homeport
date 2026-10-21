import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceServiceProvidersUsernameConflictsList } from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { ProviderUsernameConflicts } from './ProviderUsernameConflicts';

let tableOptions: any;
let tableFetch: (force?: boolean) => void;
const fetchProps = new Set<unknown>();
const useTableFetch = vi.fn();

// The table itself is covered elsewhere: here it shows its actions, and the
// test drives the fetchData it was given.
vi.mock('@/table/useTable', () => ({
  useTable: (options) => {
    tableOptions = options;
    return { rows: [], fetch: useTableFetch };
  },
}));
vi.mock('@/table/Table', () => ({
  default: ({ tableActions, fetch }) => {
    tableFetch = fetch;
    fetchProps.add(fetch);
    return <div>{tableActions}</div>;
  },
}));

const conflicts = Array.from({ length: 12 }, (_, index) => ({
  user_uuid: `user-${index}`,
  user_username: `user${index}`,
  user_full_name: `User ${index}`,
  candidates: [],
}));

const provider = { uuid: 'provider-uuid' } as any;

describe('ProviderUsernameConflicts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchProps.clear();
    vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);
    vi.mocked(
      marketplaceServiceProvidersUsernameConflictsList,
    ).mockResolvedValue({ data: conflicts } as any);
  });

  it('pages through the conflicts it fetched once', async () => {
    renderWithProviders(<ProviderUsernameConflicts provider={provider} />);
    await screen.findByRole('button', { name: 'Resolve conflicts' });

    const page = await tableOptions.fetchData({ currentPage: 2, pageSize: 10 });
    expect(page.rows).toEqual(conflicts.slice(10));
    expect(page.resultCount).toBe(12);
    expect(
      marketplaceServiceProvidersUsernameConflictsList,
    ).toHaveBeenCalledTimes(1);
  });

  it('downloads the list again only on Refresh, not on a page turn', async () => {
    renderWithProviders(<ProviderUsernameConflicts provider={provider} />);
    await screen.findByRole('button', { name: 'Resolve conflicts' });

    // The table calls fetch() on page, size, search and sort changes.
    tableFetch();
    expect(
      marketplaceServiceProvidersUsernameConflictsList,
    ).toHaveBeenCalledTimes(1);

    // Refresh and Retry call fetch(true).
    tableFetch(true);
    await waitFor(() =>
      expect(
        marketplaceServiceProvidersUsernameConflictsList,
      ).toHaveBeenCalledTimes(2),
    );
  });

  it('hands the table the same fetch on every render', async () => {
    // Table fetches again whenever fetch changes identity, so a new function
    // per render would fetch on every render.
    renderWithProviders(<ProviderUsernameConflicts provider={provider} />);
    await screen.findByRole('button', { name: 'Resolve conflicts' });

    expect(fetchProps.size).toBe(1);
  });

  it('resolves every conflict, not only the page shown', async () => {
    renderWithProviders(<ProviderUsernameConflicts provider={provider} />);

    await userEvent.click(
      await screen.findByRole('button', { name: 'Resolve conflicts' }),
    );

    const openDialog = vi.mocked(useModal().openDialog);
    await waitFor(() => expect(openDialog).toHaveBeenCalledTimes(1));
    expect((openDialog.mock.calls[0][1] as any).resolve.conflicts).toEqual(
      conflicts,
    );
  });
});
