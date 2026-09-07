import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { FooterDropdown } from './FooterDropdown';

describe('FooterDropdown', () => {
  it('renders the trigger and, once opened, its children', async () => {
    const user = userEvent.setup();
    render(
      <FooterDropdown title="Test Dropdown">
        <li data-testid="child">Child Element</li>
      </FooterDropdown>,
    );

    expect(screen.getByText('Test Dropdown')).toBeInTheDocument();
    expect(screen.getByTestId('footer-dropdown')).toHaveClass('menu-item');
    // Radix mounts the panel only once open — matching real ARIA menu
    // behaviour, unlike Metronic's original always-in-DOM-just-hidden
    // markup this replaces.
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Test Dropdown' }));
    expect(await screen.findByTestId('child')).toBeInTheDocument();
  });

  // menu-gray-600/menu-state-bg-gray is what makes a real <a> row (e.g.
  // DocsLink, LegalPrivacyMenu's Privacy policy/Terms of service) render in
  // the same colour as a plain RadixDropdownMenu.Item/<button> row (e.g.
  // IssuesLink, Cookie settings) instead of falling through to Bootstrap's
  // own green `a` color -- reported live as an inconsistent-looking menu.
  // jsdom has no real stylesheet cascade to assert the resulting color
  // against directly (see this component's own Storybook-based colour
  // verification history), so this checks the class is present rather than
  // the computed color.
  it('gives its content the shared gray color theme', async () => {
    const user = userEvent.setup();
    render(
      <FooterDropdown title="Test Dropdown">
        <li data-testid="child">Child Element</li>
      </FooterDropdown>,
    );

    await user.click(screen.getByRole('button', { name: 'Test Dropdown' }));
    const child = await screen.findByTestId('child');
    // eslint-disable-next-line testing-library/no-node-access
    const content = child.closest('[role="menu"]');
    expect(content).toHaveClass('menu-gray-600', 'menu-state-bg-gray');
  });
});
