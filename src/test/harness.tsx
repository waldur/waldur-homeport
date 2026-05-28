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
