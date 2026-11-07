import { cleanup, render, screen } from '@testing-library/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { getServiceAccessMode } from '@/marketplace/serviceAccessMode';
import { useMyTasksCount } from '@/proposals/review/useMyTasksCount';
import { useUser } from '@/workspace/hooks';

import { CallPublicMenu, CallsModeEntries } from './CallPublicMenu';
import { useProviderCallScopes } from './useProviderCallScopes';

vi.mock('@/features/connect', () => ({ isFeatureVisible: vi.fn() }));

vi.mock('@/marketplace/serviceAccessMode', () => ({
  getServiceAccessMode: vi.fn(),
}));

// Only someone with no call work in marketplace mode needs a reviewer profile
// to see the section (CallPublicMenu.marketplace.test.tsx).
vi.mock('@/reviewer/useReviewerProfile', () => ({
  useReviewerProfile: () => ({ profile: null }),
}));

vi.mock('@/proposals/review/useMyTasksCount', () => ({
  useMyTasksCount: vi.fn(),
}));

// The badges' counts are asked of the API; these tests are about the entries.
vi.mock('./useProviderCallCounts', () => ({
  countBadge: () => undefined,
  useProviderPendingRequestsCount: () => 0,
  useProviderTasksCount: () => 0,
}));

vi.mock('./useProviderCallScopes', () => ({
  useProviderCallScopes: vi.fn(),
}));

vi.mock('waldur-ui', () => ({
  SidebarMenuAccordion: ({ title, children }) => (
    <div>
      <div data-testid="section">{title}</div>
      {children}
    </div>
  ),
  SidebarMenuSeparator: () => null,
}));

vi.mock('./MenuItem', () => ({
  MenuItem: ({ title }) => <div data-testid="menu-item">{title}</div>,
}));

const reviewer = {
  uuid: 'reviewer-1',
  permissions: [{ scope_type: 'call', role_name: 'CALL.REVIEWER' }],
};
const applicant = { uuid: 'applicant-1', permissions: [] };

const items = () =>
  screen.queryAllByTestId('menu-item').map((item) => item.textContent);

const renderAs = (
  user,
  mode,
  {
    callOnly = false,
    tasks = 0,
    providers = [],
  }: {
    callOnly?: boolean;
    tasks?: number;
    providers?: { uuid: string; name: string }[];
  } = {},
) => {
  vi.mocked(useProviderCallScopes).mockReturnValue(providers);
  vi.mocked(useUser).mockReturnValue(user as any);
  vi.mocked(getServiceAccessMode).mockReturnValue(mode);
  vi.mocked(useMyTasksCount).mockReturnValue(tasks);
  vi.mocked(isFeatureVisible).mockImplementation((feature) =>
    feature === MarketplaceFeatures.call_only ? callOnly : true,
  );
  return render(<CallPublicMenu open />);
};

const sections = () =>
  screen.queryAllByTestId('section').map((item) => item.textContent);

/** Calls-only mode: the top-level entries, then the operator accordion. */
const renderCallsModeAs = (user, options = {}) => {
  renderAs(user, 'calls', options);
  const menu = { sections: sections(), items: items() };
  cleanup();
  render(<CallsModeEntries />);
  return { ...menu, entries: items() };
};

const callManager = {
  uuid: 'manager-1',
  permissions: [
    {
      scope_type: 'call',
      role_name: 'CALL.MANAGER',
      customer_uuid: 'customer-1',
    },
  ],
};

describe('CallPublicMenu per access mode', () => {
  beforeEach(() => {
    vi.mocked(useCurrentStateAndParams).mockReturnValue({
      state: { name: 'unrelated' },
      params: {},
    } as any);
  });

  // Calls-only removes the marketplace, not the work done on calls: the
  // catalogue and the user's own work are top-level entries, and only
  // operators get an accordion.
  it('gives an applicant top-level entries and no accordion in calls-only mode', () => {
    expect(renderCallsModeAs(applicant, { tasks: 1 })).toEqual({
      sections: [],
      items: [],
      entries: ['Calls for proposals', 'My proposals', 'My tasks'],
    });
  });

  it('offers an applicant their tasks once one waits for them', () => {
    expect(renderCallsModeAs(applicant).entries).toEqual([
      'Calls for proposals',
      'My proposals',
    ]);
  });

  it('leaves staff with nothing to do without their tasks entry', () => {
    const staff = { uuid: 'staff-1', is_staff: true, permissions: [] };
    expect(renderCallsModeAs(staff).entries).not.toContain('My tasks');
    expect(renderCallsModeAs(staff, { tasks: 2 }).entries).toContain(
      'My tasks',
    );
  });

  it('gives a reviewer their reviews at the top in calls-only mode', () => {
    const { sections, entries } = renderCallsModeAs(reviewer);
    expect(sections).toEqual([]);
    expect(entries).toContain('My reviews');
  });

  it('keeps the single catalogue link for calls run outside Waldur', () => {
    expect(renderCallsModeAs(applicant, { callOnly: true })).toEqual({
      sections: [],
      items: [],
      entries: ['Calls for proposals'],
    });
  });

  it('gives a call manager a Call management accordion in calls-only mode', () => {
    expect(renderCallsModeAs(callManager, { tasks: 1 })).toEqual({
      sections: ['Call management'],
      items: ['Manage calls', 'All proposals', 'All reviews'],
      entries: ['Calls for proposals', 'My proposals', expect.any(String)],
    });
  });

  it('gives a provider its calls under Call management in calls-only mode', () => {
    const { sections, items } = renderCallsModeAs(applicant, {
      providers: [{ uuid: 'provider-1', name: 'North' }],
    });
    expect(sections).toEqual(['Call management']);
    expect(items).toEqual(['Provider calls']);
  });

  it('gives an applicant no calls section in marketplace mode', () => {
    renderAs(applicant, 'marketplace');
    expect(items()).toEqual([]);
  });

  // An offering's team assesses it without holding a call role.
  it('leads someone with workflow tasks to them in marketplace mode', () => {
    renderAs(applicant, 'marketplace', { tasks: 2 });
    expect(screen.getByTestId('section')).toHaveTextContent(
      'Access management',
    );
    // Their work is tasks, not reviews: the item is named for it.
    expect(items()).toEqual(['My tasks']);
  });

  it('gives a call role holder the catalogue too in marketplace mode', () => {
    renderAs(reviewer, 'marketplace');
    expect(items()).toEqual(
      expect.arrayContaining(['Calls for proposals', 'My reviews']),
    );
  });

  const south = { uuid: 'south', name: 'Southern Centre' };
  const north = { uuid: 'north', name: 'Northern Centre' };

  it('gives a provider its calls in the Calls section', () => {
    renderAs(applicant, 'both', { providers: [south] });
    expect(items()).toContain('Provider calls');
  });

  it('names each provider when there are several', () => {
    renderAs(applicant, 'both', { providers: [north, south] });
    expect(items()).toEqual(
      expect.arrayContaining([
        'Provider calls: Northern Centre',
        'Provider calls: Southern Centre',
      ]),
    );
    expect(items()).not.toContain('Provider calls');
  });

  it('gives an applicant or a reviewer no provider entry', () => {
    renderAs(applicant, 'both');
    expect(items()).not.toEqual(
      expect.arrayContaining([expect.stringMatching(/^Provider calls/)]),
    );
    renderAs(reviewer, 'both');
    expect(items().some((item) => item.startsWith('Provider calls'))).toBe(
      false,
    );
  });

  // A provider without a call role or tasks still has calls to answer.
  it('opens the section for a provider in marketplace mode', () => {
    renderAs(applicant, 'marketplace', { providers: [south] });
    expect(screen.getByTestId('section')).toHaveTextContent(
      'Access management',
    );
    expect(items()).toContain('Provider calls');
  });
});
