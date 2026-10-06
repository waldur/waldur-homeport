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
    // Radix mounts the panel only once open — matching real ARIA menu
    // behaviour, unlike Metronic's original always-in-DOM-just-hidden
    // markup this replaces.
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
    const rows = await screen.findAllByRole('menuitem');
    expect(rows).toHaveLength(2);
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
    const panel = await screen.findByRole('menu');
    expect(panel.tagName).toBe('UL');
    expect(panel).toHaveClass('group/menu');
    expect(panel).toHaveAttribute('data-density', 'compact');
  });
});
