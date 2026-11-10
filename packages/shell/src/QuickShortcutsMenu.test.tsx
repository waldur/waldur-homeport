import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ExternalLink } from 'waldur-js-client';

import { QuickShortcutsMenu } from './QuickShortcutsMenu';

const apps = [
  {
    key: 'provider-calls',
    title: 'Calls for providers',
    description: 'Requests and assessments in calls',
    href: '/provider-calls/',
  },
];

const links = [
  {
    uuid: 'l1',
    name: 'Status page',
    description: 'Service status',
    link: 'https://status.example.org/',
    image: null,
  },
] as unknown as ExternalLink[];

const renderMenu = (props: { apps?: typeof apps; links?: ExternalLink[] }) =>
  render(
    <QuickShortcutsMenu apps={props.apps ?? []} links={props.links ?? []}>
      {(trigger) => <div data-testid="brand">{trigger}</div>}
    </QuickShortcutsMenu>,
  );

describe('QuickShortcutsMenu', () => {
  it('shows no button with nothing to list', () => {
    renderMenu({});
    expect(
      screen.queryByRole('button', { name: 'Quick shortcuts' }),
    ).not.toBeInTheDocument();
  });

  it('lists the apps above the links, both in a new tab', async () => {
    const user = userEvent.setup();
    renderMenu({ apps, links });
    await user.click(screen.getByRole('button', { name: 'Quick shortcuts' }));

    expect(screen.getByText('Apps')).toBeInTheDocument();
    expect(screen.getByText('Links')).toBeInTheDocument();
    const app = screen.getByRole('menuitem', { name: /Calls for providers/ });
    expect(app).toHaveAttribute('href', '/provider-calls/');
    expect(app).toHaveAttribute('target', '_blank');
    const link = screen.getByRole('menuitem', { name: /Status page/ });
    expect(link).toHaveAttribute('href', 'https://status.example.org/');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('lists the links alone, without headings, as before', async () => {
    const user = userEvent.setup();
    renderMenu({ links });
    await user.click(screen.getByRole('button', { name: 'Quick shortcuts' }));

    expect(screen.getByRole('menuitem', { name: /Status page/ })).toBeVisible();
    expect(screen.queryByText('Apps')).not.toBeInTheDocument();
    expect(screen.queryByText('Links')).not.toBeInTheDocument();
  });
});
