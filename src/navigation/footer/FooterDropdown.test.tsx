import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { FooterDropdown } from './FooterDropdown';
import { FooterDropdownItem } from './FooterDropdownItems';

describe('FooterDropdown', () => {
  it('renders the trigger and, once opened, its children', async () => {
    const user = userEvent.setup();
    render(
      <FooterDropdown title="Test Dropdown">
        <li data-testid="child">Child Element</li>
      </FooterDropdown>,
    );

    expect(screen.getByText('Test Dropdown')).toBeInTheDocument();
    // Radix mounts the panel only once open, unlike Metronic's original
    // always-in-DOM-just-hidden markup this replaces.
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Test Dropdown' }));
    expect(await screen.findByTestId('child')).toBeInTheDocument();
  });

  // A real <a> row (DocsLink, Privacy policy) once fell through to
  // Bootstrap's green `a` colour while the plain rows stayed gray. Every
  // row now carries the shared row colour itself instead of relying on a
  // theme class on the panel. jsdom has no stylesheet cascade, so this
  // checks the class rather than the computed colour.
  it('gives link rows and plain rows the same row styling', async () => {
    const user = userEvent.setup();
    render(
      <FooterDropdown title="Test Dropdown">
        <FooterDropdownItem>Plain row</FooterDropdownItem>
        <FooterDropdownItem asChild>
          <a href="#docs">Link row</a>
        </FooterDropdownItem>
      </FooterDropdown>,
    );

    await user.click(screen.getByRole('button', { name: 'Test Dropdown' }));
    const rows = [
      await screen.findByRole('button', { name: 'Plain row' }),
      screen.getByRole('link', { name: 'Link row' }),
    ];
    for (const row of rows) {
      expect(row).toHaveClass('text-[var(--menu-item-text)]');
    }
  });

  it('makes its <ul> panel compact, for the footer row padding', async () => {
    const user = userEvent.setup();
    render(
      <FooterDropdown title="Test Dropdown">
        <FooterDropdownItem>Row</FooterDropdownItem>
      </FooterDropdown>,
    );

    await user.click(screen.getByRole('button', { name: 'Test Dropdown' }));
    const panel = await screen.findByTestId('footer-dropdown-panel');
    expect(panel).toHaveClass('group/menu');
    expect(panel).toHaveAttribute('data-density', 'compact');
  });

  // A list of links, so a disclosure: Tab walks through the rows (not the
  // arrow keys), and Tab past the last one moves on and closes it.
  it('lets Tab walk through its rows and out', async () => {
    const user = userEvent.setup();
    render(
      <>
        <FooterDropdown title="Test Dropdown">
          <FooterDropdownItem>First</FooterDropdownItem>
          <FooterDropdownItem>Second</FooterDropdownItem>
        </FooterDropdown>
        <button type="button">After</button>
      </>,
    );

    const trigger = screen.getByRole('button', { name: 'Test Dropdown' });
    trigger.focus();
    await user.keyboard('{Enter}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.tab();
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Second' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});
