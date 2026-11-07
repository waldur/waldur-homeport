import { UIRouterReact } from '@uirouter/react';
import { describe, expect, it } from 'vitest';

import { states as marketplaceStates } from '@/marketplace/routes';
import { states as proposalStates } from '@/proposals/routes';
import { states as userStates } from '@/user/routes';

import { getCallsSidebarItem, getSidebarSection } from './sidebarSection';

// The real route declarations, so a page added under an existing area is
// covered without touching the sidebar, and a page added outside one shows up
// here as unplaced.
const router = new UIRouterReact();
router.stateRegistry.register({ name: 'layout', abstract: true });
[...userStates, ...marketplaceStates, ...proposalStates].forEach((state) =>
  router.stateRegistry.register(state as any),
);

const placement = (name: string) => {
  const state = router.stateService.get(name);
  expect(state, `state ${name} is registered`).toBeTruthy();
  return {
    section: getSidebarSection(state),
    item: getCallsSidebarItem(state),
  };
};

describe('sidebar placement of calls pages', () => {
  it.each([
    ['reviews-tasks', 'my-reviews'],
    ['reviews-all-reviews', 'my-reviews'],
    ['reviews-evaluator-roles', 'my-reviews'],
    ['reviews-assignments', 'my-reviews'],
    ['reviews-invitations', 'my-reviews'],
    ['reviews-calls', 'my-reviews'],
    ['proposal-review-view', 'my-reviews'],
    ['proposal-review', 'my-reviews'],
    ['reviewer-invitation-accept', 'my-reviews'],
    ['proposals-all-proposals', 'my-proposals'],
    ['proposals-call-proposals', 'my-proposals'],
    ['proposals.manage-proposal', 'my-proposals'],
    ['protected-call.manage', 'manage-calls'],
    ['protected-call.main', 'manage-calls'],
    ['manage-calls', 'manage-calls'],
    ['call-management.dashboard', 'manage-calls'],
    ['call-management.proposal-details', 'manage-calls'],
    ['calls-for-proposals-dashboard', 'calls-for-proposals'],
    ['calls-for-proposals-all-calls', 'calls-for-proposals'],
    ['public-calls.list-public', 'calls-for-proposals'],
    ['public-call.details', 'calls-for-proposals'],
    ['admin-proposals', 'all-proposals'],
    ['admin-reviews', 'all-reviews'],
  ])('%s opens Calls on %s', (name, item) => {
    expect(placement(name)).toEqual({ section: 'calls', item });
  });

  it('places every page under the reviews root under My reviews', () => {
    const underReviews = router.stateRegistry
      .get()
      .filter(
        (state) =>
          state.name !== 'reviews' &&
          state.$$state().path.some((part) => part.name === 'reviews'),
      );
    const misplaced = underReviews
      .filter((state) => placement(state.name).item !== 'my-reviews')
      .map((state) => state.name);
    expect(underReviews.length).toBeGreaterThan(3);
    expect(misplaced).toEqual([]);
  });
});

describe('sidebar placement of resource pages', () => {
  it.each([
    'all-resources',
    'category-resources',
    'marketplace-resource-details',
  ])('%s opens Resources', (name) => {
    expect(placement(name)).toEqual({
      section: 'resources',
      item: undefined,
    });
  });

  // Provider-side resource pages live in the provider workspace; the consumer
  // Resources accordion has no entry for them to highlight.
  it('leaves the provider resource page out of Resources', () => {
    expect(placement('marketplace-provider-resource-details').section).toBe(
      undefined,
    );
  });
});

describe('pages outside both areas', () => {
  it.each(['profile.details', 'public.marketplace-landing'])(
    '%s opens no section',
    (name) => {
      expect(placement(name)).toEqual({ section: undefined, item: undefined });
    },
  );
});
