import { describe, expect, it } from 'vitest';

import { states } from './states';

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
