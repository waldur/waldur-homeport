import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from '@uirouter/react';
import { forwardRef } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TabsList } from './TabsList';

const tabs = vi.hoisted(() => ({ current: [] as any[] }));

vi.mock('./useTabs', () => ({
  useTabs: () => tabs.current,
  isDescendantOf: () => false,
}));

vi.mock('@/core/Link', () => ({
  Link: forwardRef<HTMLAnchorElement, any>(
    ({ state, params, children, ...rest }, ref) => (
      <a
        ref={ref}
        href={`/${state}`}
        data-params={JSON.stringify(params)}
        {...rest}
      >
        {children}
      </a>
    ),
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
  beforeEach(() => {
    tabs.current = [
      { title: 'Dashboard', to: 'public.marketplace-landing' },
      {
        title: 'Offerings',
        children: [
          { title: 'All offerings', to: 'public.offerings' },
          {
            title: 'HPC',
            to: 'public.marketplace-category',
            params: { category_uuid: 'hpc' },
          },
        ],
      },
      { title: 'Orders', to: 'auth-marketplace-orders' },
    ];
  });

  it('renders a parent tab as a button with no link inside it', () => {
    render(<TabsList />);

    const trigger = screen.getByRole('button', { name: 'Offerings' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('link', { name: 'Offerings' }),
    ).not.toBeInTheDocument();
  });

  it('opens the submenu from the keyboard and lists every child', async () => {
    const user = userEvent.setup();
    render(<TabsList />);

    await user.tab();
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveFocus();
    await user.tab();
    const trigger = screen.getByRole('button', { name: 'Offerings' });
    expect(trigger).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getAllByRole('menuitem').map((item) => item.textContent),
    ).toEqual(['All offerings', 'HPC']);
    expect(
      screen.getByRole('menuitem', { name: 'All offerings' }),
    ).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'HPC' })).toHaveFocus();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('opens the submenu with Space', async () => {
    const user = userEvent.setup();
    render(<TabsList />);

    screen.getByRole('button', { name: 'Offerings' }).focus();
    await user.keyboard(' ');
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('moves on to the next tab when Tab leaves the open submenu', async () => {
    const user = userEvent.setup();
    render(<TabsList />);

    screen.getByRole('button', { name: 'Offerings' }).focus();
    await user.keyboard('{Enter}');
    await user.tab();

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Orders' })).toHaveFocus();
  });

  it('returns to the trigger when Shift+Tab leaves the open submenu', async () => {
    const user = userEvent.setup();
    render(<TabsList />);

    const trigger = screen.getByRole('button', { name: 'Offerings' });
    trigger.focus();
    await user.keyboard('{Enter}');
    await user.tab({ shift: true });

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
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
