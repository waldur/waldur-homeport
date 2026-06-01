import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FooterDropdown } from './FooterDropdown';

describe('FooterDropdown', () => {
  it('renders title and children', () => {
    render(
      <FooterDropdown title="Test Dropdown">
        <li data-testid="child">Child Element</li>
      </FooterDropdown>,
    );

    expect(screen.getByText('Test Dropdown')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByTestId('footer-dropdown')).toHaveClass('menu-item');
  });
});
