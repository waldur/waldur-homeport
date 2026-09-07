import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';

/**
 * Creates a QueryClient pre-configured for tests:
 * - Retries disabled for both queries and mutations
 * - No caching surprises between tests
 */
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
}

/**
 * Renders a component wrapped in QueryClientProvider with sensible test defaults.
 *
 * Returns the standard RTL result plus the `queryClient` instance for direct
 * inspection (e.g. spying on `invalidateQueries`).
 */
export const renderWithProviders = (
  ui: ReactElement,
  { queryClient, ...options }: RenderWithProvidersOptions = {},
) => {
  const client = queryClient ?? createTestQueryClient();
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    queryClient: client,
  };
};

interface RenderHookWithProvidersOptions {
  queryClient?: QueryClient;
}

/**
 * Wrapper factory for `renderHook` — returns a component that provides
 * QueryClientProvider with sensible test defaults.
 *
 * Usage:
 *   const { wrapper, queryClient } = createTestWrapper();
 *   const { result } = renderHook(() => useMyHook(), { wrapper });
 */
export const createTestWrapper = ({
  queryClient,
}: RenderHookWithProvidersOptions = {}) => {
  const client = queryClient ?? createTestQueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { wrapper, queryClient: client };
};

/**
 * Wraps a row-action component (anything built on ActionsDropdownItem) in an
 * already-open Radix menu.
 *
 * Radix's menu item reads its context on render and throws "`MenuItem` must
 * be used within `Menu`" outside one, so a menu row cannot be rendered bare
 * the way a react-bootstrap `Dropdown.Item` could. Rendering it in an open
 * menu is also closer to how it really runs: the row gets its
 * role="menuitem", its keyboard handling and its onSelect wiring.
 *
 * Usage:
 *   renderWithProviders(inActionsMenu(<DeleteCreditButton row={row} />));
 */
export const inActionsMenu = (children: ReactNode) => (
  <RadixDropdownMenu.Root open modal={false}>
    {/* No Trigger: it would render a real <button> into the container and
        break the "this action renders nothing" assertions that check for an
        empty container. The Content only needs an anchor for positioning,
        which is irrelevant in jsdom. */}
    <RadixDropdownMenu.Portal>
      <RadixDropdownMenu.Content>{children}</RadixDropdownMenu.Content>
    </RadixDropdownMenu.Portal>
  </RadixDropdownMenu.Root>
);
