import {
  pushStateLocationPlugin,
  servicesPlugin,
  UIRouterReact,
} from '@uirouter/react';

import { getLandingState } from '@/auth/landingState';

// Create a new instance of the Router
export const router = new UIRouterReact();

router.plugin(servicesPlugin);
router.plugin(pushStateLocationPlugin);

// Global config for router
router.urlService.config.strictMode(false);
// A function, so the access mode is read once the configuration has loaded.
router.urlService.rules.initial(() => ({ state: getLandingState() }));
