import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { ENV } from '@/core/config';

import { FooterLinks } from './FooterLinks';
import { useFooterLinks } from './useFooterLinks';

vi.mock('./useFooterLinks');
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
    ENV.plugins.WALDUR_CORE.ABOUT_US_PAGE_ENABLED = false;
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

  it.each([false, true])(
    'renders About us as a top-level link when enabled (isMd=%s)',
    (isMd) => {
      ENV.plugins.WALDUR_CORE.ABOUT_US_PAGE_ENABLED = true;
      vi.mocked(useFooterLinks).mockReturnValue({
        isMd,
        config: { dynamic: [] },
      } as any);

      render(<FooterLinks />);

      expect(screen.getByText('About us')).toBeInTheDocument();
    },
  );

  it('hides About us when the page is disabled', () => {
    vi.mocked(useFooterLinks).mockReturnValue({
      isMd: false,
      config: { dynamic: [] },
    } as any);

    render(<FooterLinks />);

    expect(screen.queryByText('About us')).not.toBeInTheDocument();
  });
});
