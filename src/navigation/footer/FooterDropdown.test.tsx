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
});
