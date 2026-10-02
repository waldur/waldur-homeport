import { describe, expect, it } from 'vitest';

import { states } from './states';
import { canAccessServiceProviderWorkspace } from './workspace/selectors';

/**
 * TabsList renders a parent tab's own trigger as a link to
 * `redirectTo || to`. An abstract state cannot be entered, so a parent tab
 * without a redirectTo answers a click with
 * "Cannot transition to abstract state" and a stack trace in the console.
 */
const tabParents = states.filter(
  (state) =>
    state.abstract && state.data?.breadcrumb && !state.data?.skipBreadcrumb,
);

const byName = new Map(states.map((state) => [state.name, state]));

const redirectTarget = (state) =>
  typeof state.redirectTo === 'string'
    ? state.redirectTo
    : state.redirectTo?.state;

describe('abstract states shown as tabs', () => {
  it('finds the parent tabs to check', () => {
    expect(tabParents.length).toBeGreaterThan(0);
  });

  it.each(tabParents.map((state) => [state.name, state]))(
    '%s declares a redirectTo',
    (_name, state) => {
      expect(redirectTarget(state)).toBeTruthy();
    },
  );

  it.each(tabParents.map((state) => [state.name, state]))(
    '%s redirects to a registered, non-abstract state',
    (_name, state) => {
      const target = byName.get(redirectTarget(state));
      expect(target).toBeDefined();
      expect(target.abstract).toBeFalsy();
    },
  );
});

/**
 * A child state that declares its own `data.permissions` replaces the ones it
 * would inherit, so every guarded page under the provider workspace has to
 * repeat the workspace guard or a typed address bypasses it.
 */
describe('provider workspace states', () => {
  const parentOf = (state) =>
    state.parent ??
    (state.name.includes('.')
      ? state.name.slice(0, state.name.lastIndexOf('.'))
      : undefined);

  const ancestry = (state) => {
    const chain = [];
    for (let s = state; s; s = byName.get(parentOf(s))) chain.push(s);
    return chain;
  };

  const providerStates = states.filter((state) =>
    ancestry(state).some((s) => s.name === 'marketplace-provider'),
  );

  it('finds the provider workspace states', () => {
    expect(providerStates.length).toBeGreaterThan(10);
  });

  it.each(providerStates.map((state) => [state.name, state]))(
    '%s is guarded by the workspace access check',
    (_name, state) => {
      const guarded = ancestry(state).find((s) => s.data?.permissions);
      expect(guarded?.data.permissions).toContain(
        canAccessServiceProviderWorkspace,
      );
    },
  );
});
