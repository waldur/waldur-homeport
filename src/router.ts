import { UIRouterReact } from '@uirouter/react';

// Create a new instance of the Router
export const router = new UIRouterReact();

// Global config for router
router.urlService.rules.initial({ state: 'profile.details' });
