import { vi } from 'vitest';

const { mockRouter, mockUIRouterReact } = vi.hoisted(() => {
  const router = {
    stateService: {
      go: vi.fn(),
      target: vi.fn(),
      params: vi.fn().mockReturnValue({}),
      href: vi.fn(),
    },
    urlService: {
      path: vi.fn(),
      search: vi.fn().mockReturnValue({}),
      url: vi.fn(),
      config: {
        strictMode: vi.fn(),
      },
      rules: {
        initial: vi.fn(),
      },
    },
    globals: {
      $current: {
        name: 'home',
        path: [],
        parent: null,
      },
      params: {},
    },
    transitionService: {
      onBefore: vi.fn(),
      onStart: vi.fn(),
      onSuccess: vi.fn(),
      onError: vi.fn(),
    },
  };
  return {
    mockRouter: router,
    mockUIRouterReact: {
      useRouter: vi.fn(() => router),
      useCurrentStateAndParams: vi.fn(() => ({
        state: router.globals.$current,
        params: router.globals.params,
      })),
      useTransition: vi.fn(),
      UISref: ({ children }) => children,
      UISrefActive: ({ children }) => children,
      UIRouter: ({ children }) => children,
      UIView: () => null,
      useSref: (state, params) => ({
        href: state + (params ? JSON.stringify(params) : ''),
        onClick: vi.fn(),
      }),
    },
  };
});

vi.mock('@/router', () => ({
  router: mockRouter,
}));

vi.mock('@uirouter/react', async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    ...mockUIRouterReact,
  };
});
