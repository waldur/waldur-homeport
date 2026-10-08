import {
  QueryClient,
  QueryClientConfig,
  QueryClientProvider,
} from '@tanstack/react-query';
import {
  render,
  renderHook,
  RenderHookOptions,
  RenderOptions,
} from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';

import { Menu } from 'waldur-ui';

/**
 * Creates a QueryClient pre-configured for tests:
 * - Retries disabled for both queries and mutations (fast fail)
 * - gcTime set to Infinity to prevent unexpected background garbage collection during async tests
 * - staleTime set to 0 for predictable invalidation behavior
 * - refetchOnWindowFocus disabled in jsdom
 */
export const createTestQueryClient = (config?: QueryClientConfig) =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
        staleTime: 0,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
    ...config,
  });

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  wrapper?: React.ComponentType<{ children: ReactNode }>;
}

/**
 * Renders a component wrapped in QueryClientProvider with sensible test defaults.
 *
 * Returns the standard RTL result plus the `queryClient` instance for direct
 * inspection (e.g. spying on `invalidateQueries`).
 */
export const renderWithProviders = (
  ui: ReactElement,
  {
    queryClient,
    wrapper: CustomWrapper,
    ...options
  }: RenderWithProvidersOptions = {},
) => {
  const client = queryClient ?? createTestQueryClient();
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      {CustomWrapper ? <CustomWrapper>{children}</CustomWrapper> : children}
    </QueryClientProvider>
  );
  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    queryClient: client,
  };
};

interface RenderHookWithProvidersOptions<Props> extends Omit<
  RenderHookOptions<Props>,
  'wrapper'
> {
  queryClient?: QueryClient;
  wrapper?: React.ComponentType<{ children: ReactNode }>;
}

/**
 * Renders a hook wrapped in QueryClientProvider with sensible test defaults.
 *
 * Returns the standard `renderHook` result plus the `queryClient` instance for direct
 * inspection or cache operations.
 *
 * Usage:
 *   const { result, queryClient } = renderHookWithProviders(() => useMyHook());
 */
export const renderHookWithProviders = <Result, Props>(
  renderCallback: (initialProps: Props) => Result,
  {
    queryClient,
    wrapper: CustomWrapper,
    ...options
  }: RenderHookWithProvidersOptions<Props> = {},
) => {
  const client = queryClient ?? createTestQueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      {CustomWrapper ? <CustomWrapper>{children}</CustomWrapper> : children}
    </QueryClientProvider>
  );
  return {
    ...renderHook(renderCallback, { wrapper, ...options }),
    queryClient: client,
  };
};

interface CreateTestWrapperOptions {
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
}: CreateTestWrapperOptions = {}) => {
  const client = queryClient ?? createTestQueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { wrapper, queryClient: client };
};

/**
 * Wraps a row-action component (anything built on Menu.Item) in an
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
  <Menu open>
    {/* No Trigger: it would render a real <button> into the container and
          break the "this action renders nothing" assertions that check for an
          empty container. The Content only needs an anchor for positioning,
          which is irrelevant in jsdom. */}
    <Menu.Content look="actions">{children}</Menu.Content>
  </Menu>
);

export { setViewport } from 'waldur-ui';
