import {
  BrowserLocationConfig,
  pushStateLocationPlugin,
  servicesPlugin,
  UIRouterReact,
} from '@uirouter/react';

import { getLandingState } from '@/auth/landingState';

// Create a new instance of the Router
export const router = new UIRouterReact();

router.plugin(servicesPlugin);
router.plugin(pushStateLocationPlugin);
// The router reads its base from a <base> element by default. index.html has
// none, because the Content-Security-Policy's base-uri 'none' refuses one, so
// it is given the path the app was built for (Vite's base) instead.
(router.locationConfig as BrowserLocationConfig).baseHref(
  import.meta.env.BASE_URL,
);

// Global config for router
router.urlService.config.strictMode(false);
// A function, so the access mode is read once the configuration has loaded.
router.urlService.rules.initial(() => ({ state: getLandingState() }));
