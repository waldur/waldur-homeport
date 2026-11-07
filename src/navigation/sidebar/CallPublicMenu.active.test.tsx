import { render, screen } from '@testing-library/react';
import { UIRouterReact, useCurrentStateAndParams } from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { states as marketplaceStates } from '@/marketplace/routes';
import { states as proposalStates } from '@/proposals/routes';
import { useUser } from '@/workspace/hooks';

import { CallPublicMenu } from './CallPublicMenu';
import { useProviderCallScopes } from './useProviderCallScopes';

vi.mock('@/features/connect', () => ({ isFeatureVisible: () => true }));

vi.mock('@/marketplace/serviceAccessMode', () => ({
  getServiceAccessMode: () => 'both',
}));

// Only someone with no call work in marketplace mode needs a reviewer profile
// to see the section (CallPublicMenu.marketplace.test.tsx).
vi.mock('@/reviewer/useReviewerProfile', () => ({
  useReviewerProfile: () => ({ profile: null }),
}));

vi.mock('@/proposals/review/useMyTasksCount', () => ({
  useMyTasksCount: () => 0,
}));

// The badges' counts are asked of the API; these tests are about the entries.
vi.mock('./useProviderCallCounts', () => ({
  countBadge: () => undefined,
  useProviderPendingRequestsCount: () => 0,
  useProviderTasksCount: () => 0,
}));

vi.mock('./useProviderCallScopes', () => ({
  useProviderCallScopes: vi.fn(() => []),
}));

vi.mock('waldur-ui', () => ({
  SidebarMenuAccordion: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarMenuSeparator: () => null,
}));

vi.mock('./MenuItem', () => ({
  MenuItem: ({ title, activeState }) => (
    <div data-testid="menu-item" data-active={String(Boolean(activeState))}>
      {title}
    </div>
  ),
}));

// The real route declarations, so each case below reads the `data` a page
// actually inherits rather than a hand-written copy of it.
const router = new UIRouterReact();
router.stateRegistry.register({ name: 'layout', abstract: true });
router.stateRegistry.register({ name: 'public', abstract: true });
proposalStates.forEach((state) => router.stateRegistry.register(state as any));
// The provider's call pages, under the provider workspace they hang off.
marketplaceStates
  .filter(
    (state) =>
      state.name === 'marketplace-provider' ||
      state.name === 'provider-calls' ||
      state.parent === 'provider-calls',
  )
  .forEach((state) => router.stateRegistry.register(state as any));

const callManager = {
  uuid: 'user-1',
  permissions: [
    {
      scope_type: 'call',
      role_name: 'CALL.MANAGER',
      customer_uuid: 'customer-1',
    },
  ],
};

const highlightedOn = (name: string, params: Record<string, string> = {}) => {
  vi.mocked(useCurrentStateAndParams).mockReturnValue({
    state: router.stateService.get(name),
    params,
  } as any);
  render(<CallPublicMenu open />);
  return screen
    .getAllByTestId('menu-item')
    .filter((item) => item.dataset.active === 'true')
    .map((item) => item.textContent);
};

describe('CallPublicMenu highlighted entry', () => {
  beforeEach(() => {
    vi.mocked(useUser).mockReturnValue(callManager as any);
  });

  // A call manager reviews nothing: their own work is named tasks.
  it.each([
    ['reviews-tasks', 'My tasks'],
    ['reviews-all-reviews', 'My tasks'],
    ['reviews-evaluator-roles', 'My tasks'],
    ['reviews-assignments', 'My tasks'],
    ['reviews-invitations', 'My tasks'],
    ['reviews-calls', 'My tasks'],
    ['proposals-all-proposals', 'My proposals'],
    ['proposals.manage-proposal', 'My proposals'],
    ['protected-call.manage', 'Manage calls'],
    ['protected-call.main', 'Manage calls'],
    ['manage-calls', 'Manage calls'],
    ['call-management.dashboard', 'Manage calls'],
    ['calls-for-proposals-dashboard', 'Calls for proposals'],
    ['public-call.details', 'Calls for proposals'],
    ['admin-proposals', 'All proposals'],
    ['admin-reviews', 'All reviews'],
  ])('%s highlights %s', (name, title) => {
    expect(highlightedOn(name)).toEqual([title]);
  });

  // Without Manage calls in the menu, a call page belongs to the catalogue it
  // was opened from rather than to nothing.
  it('falls back to Calls for proposals on a call page for a non-manager', () => {
    vi.mocked(useUser).mockReturnValue({ uuid: 'user-2' } as any);
    expect(highlightedOn('protected-call.manage')).toEqual([
      'Calls for proposals',
    ]);
  });

  it('highlights nothing on a page outside the calls area', () => {
    router.stateRegistry.register({ name: 'unrelated', parent: 'layout' });
    expect(highlightedOn('unrelated')).toEqual([]);
  });
});

describe('CallPublicMenu provider entry', () => {
  const south = { uuid: 'south', name: 'Southern Centre' };
  const north = { uuid: 'north', name: 'Northern Centre' };

  beforeEach(() => {
    vi.mocked(useUser).mockReturnValue({ uuid: 'owner-1' } as any);
    vi.mocked(useProviderCallScopes).mockReturnValue([south]);
  });

  it.each([
    'marketplace-provider-calls',
    'marketplace-provider-call-tasks',
    'marketplace-provider-call-proposals',
    'marketplace-provider-call-demand',
  ])('%s highlights Provider calls', (name) => {
    expect(highlightedOn(name, { uuid: 'south' })).toEqual(['Provider calls']);
  });

  // Opened from the provider's proposals, a proposal stays the provider's:
  // the offering team's view of it is a page of the provider's own.
  it('keeps a proposal opened by the provider on Provider calls', () => {
    expect(
      highlightedOn('provider-call-proposal', {
        uuid: 'south',
        proposal_uuid: 'p-1',
      }),
    ).toEqual(['Provider calls']);
  });

  it('leaves a proposal opened otherwise on My proposals', () => {
    expect(
      highlightedOn('proposals.manage-proposal', { proposal_uuid: 'p-1' }),
    ).toEqual(['My proposals']);
  });

  it('highlights only the provider whose pages are open', () => {
    vi.mocked(useProviderCallScopes).mockReturnValue([north, south]);
    expect(
      highlightedOn('marketplace-provider-call-proposals', { uuid: 'north' }),
    ).toEqual(['Provider calls: Northern Centre']);
  });
});
