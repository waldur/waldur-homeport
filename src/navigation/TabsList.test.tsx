import { render, screen } from '@testing-library/react';
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
});
