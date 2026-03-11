import {
  pushStateLocationPlugin,
  servicesPlugin,
  UIRouterReact,
} from '@uirouter/react';

// Create a new instance of the Router
export const router = new UIRouterReact();

router.plugin(servicesPlugin);
router.plugin(pushStateLocationPlugin);

// Global config for router
router.urlService.config.strictMode(false);
router.urlService.rules.initial({ state: 'profile.details' });
