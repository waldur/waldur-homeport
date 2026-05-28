import {
  pushStateLocationPlugin,
  servicesPlugin,
  UIRouterReact,
} from '@uirouter/react';

/**
 * Creates a real UIRouterReact instance pre-configured for tests.
 * Use this when you need a real router instead of a mock.
 */
export const createTestRouter = () => {
  const router = new UIRouterReact();
  router.plugin(servicesPlugin);
  router.plugin(pushStateLocationPlugin);
  return router;
};
