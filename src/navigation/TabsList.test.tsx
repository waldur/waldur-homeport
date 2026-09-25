import { render, screen } from '@testing-library/react';
import { useRouter } from '@uirouter/react';
import { describe, expect, it, vi } from 'vitest';

import { TabsList } from './TabsList';

const tabs = vi.hoisted(() => ({ current: [] as any[] }));

vi.mock('./useTabs', () => ({
  useTabs: () => tabs.current,
  isDescendantOf: () => false,
}));

vi.mock('@/core/Link', () => ({
  Link: ({ state, children }) => (
    <span data-testid={`link-${state}`}>{children}</span>
  ),
}));

/** A router sitting on `state`, with whatever `tab` param the URL carries. */
const mockRouterOn = (state: string, params: Record<string, any> = {}) =>
  vi.mocked(useRouter).mockReturnValue({
    stateService: {
      // Mirrors UI-Router: with params supplied, they must match the URL too.
      is: (name, wanted?) =>
        name === state &&
        (!wanted || Object.entries(wanted).every(([k, v]) => params[k] === v)),
    },
    globals: { params, current: { name: state } },
  } as any);

describe('TabsList', () => {
  it('links a parent tab to the first entry of its own submenu', () => {
    tabs.current = [
      {
        title: 'Managed projects',
        to: 'managed-projects',
        // What the route table declares — the router never reaches it, since
        // transitionTo rejects an abstract target before hooks run.
        redirectTo: 'marketplace-provider-project-templates',
        children: [
          {
            title: 'Externally managed projects',
            to: 'marketplace-provider-managed-projects',
          },
          {
            title: 'Managed Projects Audit Log',
            to: 'marketplace-provider-managed-projects-audit',
          },
        ],
      },
    ];

    render(<TabsList />);

    expect(
      screen.getByTestId('link-marketplace-provider-managed-projects'),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('link-marketplace-provider-project-templates'),
    ).not.toBeInTheDocument();
  });

  const pageTabs = [
    {
      title: 'User profile',
      to: 'profile-manage',
      params: { tab: 'user-details' },
    },
    {
      title: 'Reviewer profile',
      to: 'profile-manage',
      params: { tab: 'reviewer' },
    },
  ];

  // Routes declare `tab` with no default, so the first visit carries no ?tab=.
  // The page still renders its first tab, so that tab must be the highlighted
  // one — otherwise the open tab looks unselected until it is clicked.
  it('highlights the default tab when the URL names none', () => {
    tabs.current = pageTabs;
    mockRouterOn('profile-manage');

    render(<TabsList />);

    expect(screen.getByTestId('tab-user-details')).toHaveClass('here');
    expect(screen.getByTestId('tab-reviewer')).not.toHaveClass('here');
  });

  it('skips a hidden tab, which is never rendered', () => {
    tabs.current = [{ ...pageTabs[0], visible: false }, pageTabs[1]];
    mockRouterOn('profile-manage');

    render(<TabsList />);

    expect(screen.getByTestId('tab-reviewer')).toHaveClass('here');
  });

  it('leaves tabs pointing at another state alone', () => {
    tabs.current = [{ title: 'Elsewhere', to: 'profile-freeipa' }];
    mockRouterOn('profile-manage');

    render(<TabsList />);

    expect(screen.getByTestId('tab-profile-freeipa')).not.toHaveClass('here');
  });

  // A stale or mistyped ?tab= also renders the first tab, so it is highlighted.
  it('highlights the default tab when ?tab= names no tab', () => {
    tabs.current = pageTabs;
    mockRouterOn('profile-manage', { tab: 'bogus' });

    render(<TabsList />);

    expect(screen.getByTestId('tab-user-details')).toHaveClass('here');
    expect(screen.getByTestId('tab-reviewer')).not.toHaveClass('here');
  });

  it('skips a parent tab whose children are all hidden', () => {
    tabs.current = [
      {
        title: 'Accounting',
        redirectTo: {
          state: 'profile-manage',
          params: { tab: 'components' },
        },
        children: [
          {
            title: 'Components',
            to: 'profile-manage',
            params: { tab: 'components' },
            visible: false,
          },
        ],
      },
      pageTabs[1],
    ];
    mockRouterOn('profile-manage');

    render(<TabsList />);

    expect(screen.getByTestId('tab-reviewer')).toHaveClass('here');
  });

  it('still prefers the tab the URL names', () => {
    tabs.current = pageTabs;
    mockRouterOn('profile-manage', { tab: 'reviewer' });

    render(<TabsList />);

    expect(screen.getByTestId('tab-reviewer')).toHaveClass('here');
    expect(screen.getByTestId('tab-user-details')).not.toHaveClass('here');
  });
});
