import { UIRouterReact } from '@uirouter/react';
import { describe, expect, it, vi } from 'vitest';

import { getTabs } from '@/navigation/useTabs';

import { states } from './routes';

// Show every entry regardless of deployment flags and the viewer's role, so
// the check covers the whole menu a staff user can see.
vi.mock('@/features/connect', () => ({ isFeatureVisible: () => true }));
vi.mock('@/store/store', () => ({
  default: { getState: () => ({ workspace: { user: { is_staff: true } } }) },
}));

const registerAdminStates = () => {
  const router = new UIRouterReact();
  router.stateRegistry.register({ name: 'layout', abstract: true });
  states.forEach((state) => router.stateRegistry.register(state as any));
  return router;
};

describe('administration header menu', () => {
  // UI-Router hands a state without its own `data` the parent's `data`, so a
  // redirect-only child of a submenu inherits the submenu's breadcrumb and is
  // listed inside it under the submenu's own name ("Configuration" twice under
  // Configuration). Such states need `skipBreadcrumb`.
  it('lists no entry under the name of the submenu it sits in', () => {
    const router = registerAdminStates();
    const tabs = getTabs(
      router.stateRegistry.get('admin'),
      router.stateRegistry.get(),
    );

    const echoes = tabs.flatMap((tab) =>
      tab.children
        .filter((child) => child.title === tab.title)
        .map((child) => `${tab.title} > ${child.to}`),
    );
    expect(tabs.length).toBeGreaterThan(0);
    expect(echoes).toEqual([]);
  });
});
