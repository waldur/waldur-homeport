import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { useModal } from '@/modal/actions';

import { LegalPrivacyMenu } from './LegalPrivacyMenu';

// FooterDropdown hosts its rows in waldur-ui's Menu (see FooterDropdown.tsx);
// the mock keeps the title and renders the rows in an open Menu, so they
// render as real menu items.
vi.mock('./FooterDropdown', async () => {
  const { Menu } = await import('waldur-ui');
  return {
    FooterDropdown: ({ title, children }: any) => (
      <div data-testid="legal-privacy-dropdown">
        <span>{title}</span>
        <Menu open>
          <Menu.Content>{children}</Menu.Content>
        </Menu>
      </div>
    ),
  };
});
vi.mock('@/core/Link', () => ({
  Link: ({ label, children, state }: any) => (
    <a href={`#${state}`}>{label || children}</a>
  ),
}));
const agreements = vi.hoisted(() => ({
  hasPrivacyPolicy: true,
  hasTermsOfService: true,
}));
vi.mock('@/about/useAvailableUserAgreements', () => ({
  useAvailableUserAgreements: () => agreements,
}));
vi.mock('../cookies/CookieSettingsDialog', () => ({
  CookieSettingsDialog: () => <div>Cookie Settings Dialog</div>,
}));

describe('LegalPrivacyMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    agreements.hasPrivacyPolicy = true;
    agreements.hasTermsOfService = true;
  });

  it('renders legal and privacy links', () => {
    render(<LegalPrivacyMenu />);

    expect(screen.getByTestId('legal-privacy-dropdown')).toBeInTheDocument();
    expect(screen.getByText('Legal & Privacy')).toBeInTheDocument();
    expect(screen.getByText('Cookie settings')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Privacy policy' }),
    ).toHaveAttribute('href', '#about.privacy');
    expect(
      screen.getByRole('link', { name: 'Terms of service' }),
    ).toHaveAttribute('href', '#about.tos');
  });

  it('hides links to agreements without content', () => {
    agreements.hasPrivacyPolicy = false;
    agreements.hasTermsOfService = false;
    render(<LegalPrivacyMenu />);

    expect(screen.getByText('Cookie settings')).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Privacy policy' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Terms of service' }),
    ).not.toBeInTheDocument();
  });

  it('shows only the agreement that has content', () => {
    agreements.hasPrivacyPolicy = false;
    render(<LegalPrivacyMenu />);

    expect(
      screen.queryByRole('link', { name: 'Privacy policy' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Terms of service' }),
    ).toBeInTheDocument();
  });

  it('opens cookie settings dialog', async () => {
    const user = userEvent.setup();
    render(<LegalPrivacyMenu />);

    await user.click(screen.getByText('Cookie settings'));

    expect(useModal().openDialog).toHaveBeenCalledTimes(1);
  });
});
