import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceGlobalCategoriesRetrieve } from 'waldur-js-client';

import { SidebarProvider } from 'waldur-ui';

import { getCategoryGroups } from '@/marketplace/common/api';

import { ResourcesMenu } from './ResourcesMenu';
import { useOfferingCategories } from './utils';

vi.mock('@/marketplace/common/api', () => ({
  getCategoryGroups: vi.fn().mockResolvedValue([]),
}));

vi.mock('react-redux', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-redux')>();
  return {
    ...actual,
    useSelector: vi.fn().mockReturnValue(undefined),
    useDispatch: () => vi.fn(),
  };
});

vi.mock('./utils', () => ({
  useOfferingCategories: vi.fn(),
  useExclusiveOpen: () => ({ openId: undefined, toggle: vi.fn() }),
}));

vi.mock('./resources-filter/ResourcesMenuFilterButton', () => ({
  ResourcesMenuFilterButton: () => <span>Filter</span>,
}));

vi.mock('./MenuItem', () => ({
  MenuItem: ({ title, badge }: { title: string; badge?: number }) => (
    <div data-testid="mock-menu-item">
      <span>{title}</span>
      {badge !== undefined && <span data-testid="badge">{badge}</span>}
    </div>
  ),
}));

describe('ResourcesMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    );
    vi.mocked(getCategoryGroups).mockResolvedValue([] as any);
    vi.mocked(marketplaceGlobalCategoriesRetrieve).mockResolvedValue({
      data: { 'cat-1': 42 },
    } as any);
  });

  it('does not mutate frozen category objects in React Query cache', async () => {
    const frozenCategory = Object.freeze({
      uuid: 'cat-1',
      title: 'Virtual Machines',
      offering_count: 5,
    });

    vi.mocked(useOfferingCategories).mockReturnValue([frozenCategory as any]);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    // Seed counters query cache so counters are immediately available
    queryClient.setQueryData(
      ['ResourcesMenu', 'Counters', 'user-1', undefined, undefined],
      { 'cat-1': 42 },
    );

    expect(() =>
      render(
        <QueryClientProvider client={queryClient}>
          <SidebarProvider>
            <ResourcesMenu user={{ uuid: 'user-1' } as any} open={true} />
          </SidebarProvider>
        </QueryClientProvider>,
      ),
    ).not.toThrow();

    expect(await screen.findByText('Virtual Machines')).toBeInTheDocument();
    expect(screen.getAllByText('42')).toHaveLength(2);

    // Verify the cached object itself was NOT mutated
    expect((frozenCategory as any).resource_count).toBeUndefined();
  });
});
