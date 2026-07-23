import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { FooterLinks } from './FooterLinks';
import { useFooterLinks } from './useFooterLinks';

vi.mock('./useFooterLinks');
vi.mock('@/metronic/components', () => ({
  MenuComponent: { reinitialization: vi.fn() },
  DrawerComponent: { getInstance: vi.fn() },
}));
vi.mock('./MenuItem', () => ({
  MenuItem: ({ label }: any) => <li data-testid="menu-item">{label}</li>,
}));
vi.mock('./MobileMenu', () => ({
  MobileMenu: () => <li data-testid="mobile-menu">Mobile Menu</li>,
}));
vi.mock('./SupportMenu', () => ({
  SupportMenu: () => <li data-testid="support-menu">Support Menu</li>,
}));
vi.mock('./LegalPrivacyMenu', () => ({
  LegalPrivacyMenu: () => (
    <li data-testid="legal-privacy-menu">Legal & Privacy Menu</li>
  ),
}));

describe('FooterLinks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders desktop layout correctly', () => {
    vi.mocked(useFooterLinks).mockReturnValue({
      isMd: false,
      config: {
        dynamic: [{ id: 'calls', label: 'Calls', state: 'calls' }],
      },
    } as any);

    render(<FooterLinks />);

    expect(screen.getAllByTestId('menu-item')).toHaveLength(1);
    expect(screen.getByText('Calls')).toBeInTheDocument();
    expect(screen.getByTestId('legal-privacy-menu')).toBeInTheDocument();
    expect(screen.getByTestId('support-menu')).toBeInTheDocument();
  });

  it('renders mobile layout correctly', () => {
    vi.mocked(useFooterLinks).mockReturnValue({
      isMd: true,
      config: {
        dynamic: [{ id: 'calls', label: 'Calls', state: 'calls' }],
      },
    } as any);

    render(<FooterLinks />);

    expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
    expect(screen.getByTestId('legal-privacy-menu')).toBeInTheDocument();
    expect(screen.getByTestId('support-menu')).toBeInTheDocument();
  });
});
