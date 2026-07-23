import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { useModal } from '@/modal/actions';

import { LegalPrivacyMenu } from './LegalPrivacyMenu';

vi.mock('./FooterDropdown', () => ({
  FooterDropdown: ({ title, children }: any) => (
    <div data-testid="legal-privacy-dropdown">
      <span>{title}</span>
      {children}
    </div>
  ),
}));
vi.mock('@/core/Link', () => ({
  Link: ({ label, children, state }: any) => (
    <a href={`#${state}`}>{label || children}</a>
  ),
}));
vi.mock('../cookies/CookieSettingsDialog', () => ({
  CookieSettingsDialog: () => <div>Cookie Settings Dialog</div>,
}));

describe('LegalPrivacyMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it('opens cookie settings dialog', async () => {
    const user = userEvent.setup();
    render(<LegalPrivacyMenu />);

    await user.click(screen.getByText('Cookie settings'));

    expect(useModal().openDialog).toHaveBeenCalledTimes(1);
  });
});
