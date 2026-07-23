import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MobileMenu } from './MobileMenu';

vi.mock('./MenuItem', () => ({
  MenuItem: ({ label }: any) => <li data-testid="menu-item">{label}</li>,
}));
vi.mock('./FooterDropdown', () => ({
  FooterDropdown: ({ title, children }: any) => (
    <li data-testid="footer-dropdown">
      <span>{title}</span>
      <ul>{children}</ul>
    </li>
  ),
}));

describe('MobileMenu', () => {
  it('groups items when dynamicItems length >= 2', () => {
    const dynamicItems = [
      { id: '1', label: 'Item 1' },
      { id: '2', label: 'Item 2' },
    ] as any;

    render(<MobileMenu dynamicItems={dynamicItems} />);

    expect(screen.getByTestId('footer-dropdown')).toBeInTheDocument();
    expect(screen.getByText('More')).toBeInTheDocument();
    expect(screen.getAllByTestId('menu-item')).toHaveLength(2);
  });

  it('renders standalone items when dynamicItems length < 2', () => {
    const dynamicItems = [{ id: '1', label: 'Item 1' }] as any;

    render(<MobileMenu dynamicItems={dynamicItems} />);

    expect(screen.queryByTestId('footer-dropdown')).not.toBeInTheDocument();
    expect(screen.getAllByTestId('menu-item')).toHaveLength(1);
  });
});
